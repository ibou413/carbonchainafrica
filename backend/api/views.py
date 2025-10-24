from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics, permissions
from .models import CarbonCredit, Project, Listing
from .serializers import  ProjectSerializer, ProjectVerificationSerializer,   CarbonCreditSerializer, ListingCreateSerializer, ListingSerializer
from .permissions import IsSellerUser, IsVerifierUser, IsBuyerUser

# PROJECT AND LISTING VIEWS


class ProjectReviewAPIView(generics.UpdateAPIView):
    """
    API endpoint for a Verifier to approve or reject a project.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectVerificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifierUser]

    def perform_update(self, serializer):
        serializer.save(verifier=self.request.user)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Check if the project is being approved
        if serializer.validated_data.get('status') == Project.ProjectStatus.APPROVED and instance.status != Project.ProjectStatus.APPROVED:
            serial_number = serializer.validated_data.get('serial_number')
            token_address = serializer.validated_data.get('token_address')

            if not serial_number or not token_address:
                raise serializers.ValidationError({"error": "Serial number and token address are required for approved projects."}, code=status.HTTP_400_BAD_REQUEST)

            self.perform_update(serializer)

            # Create a single CarbonCredit for the entire project's tonnage
            CarbonCredit.objects.create(
                project=instance,
                owner=instance.owner, # Initially owned by the project owner
                hedera_token_id=token_address,
                serial_number=serial_number,
                status=CarbonCredit.CreditStatus.MINTED
            )
        else:
            self.perform_update(serializer)

        return Response(serializer.data)


class ProjectDetailAPIView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve a project's details.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyProjectListAPIView(generics.ListAPIView):
    """
    API endpoint for a Seller to list all of their own projects.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsSellerUser]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)


class PendingProjectListAPIView(generics.ListAPIView):
    """
    API endpoint for a Verifier to list all projects pending review.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifierUser]

    def get_queryset(self):
        return Project.objects.filter(status=Project.ProjectStatus.PENDING)


class VerifierDashboardListAPIView(generics.ListAPIView):
    """
    API endpoint for a Verifier to list all projects for their dashboard:
    - All projects pending review.
    - All projects already verified by the current user.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifierUser]

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        queryset = Project.objects.filter(
            Q(status=Project.ProjectStatus.PENDING) | Q(verifier=user)
        ).distinct()
        return queryset


class ProjectListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint to list approved projects or create a new project.
    List: Anyone authenticated can see approved projects.
    Create: Only users with the 'SELLER' role can create a new project.
    """
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSellerUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Only list projects that have been approved
        return Project.objects.filter(status=Project.ProjectStatus.APPROVED)

    def perform_create(self, serializer):
        # The serializer's create method will handle assigning the owner
        serializer.save()



class ListingListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint to list active credits for sale or create a new listing.
    List (GET): Any user can see active listings.
    Create (POST): Only an authenticated seller can create a new listing.
    """
    queryset = Listing.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ListingCreateSerializer
        return ListingSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSellerUser()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Re-serialize with the detailed serializer for the response
        response_serializer = ListingSerializer(serializer.instance)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class MyListingsAPIView(generics.ListAPIView):
    """
    API endpoint for a Seller to list all of their own listings (active and inactive).
    """
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsSellerUser]

    def get_queryset(self):
        return Listing.objects.filter(seller=self.request.user).order_by('-created_at')




class UserNFTListView(generics.ListAPIView):
    """
    API endpoint for a user to list all of their own CarbonCredit tokens.
    """
    serializer_class = CarbonCreditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CarbonCredit.objects.filter(owner=self.request.user)


class NFTDetailView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve the details of a specific CarbonCredit token.
    """
    queryset = CarbonCredit.objects.all()
    serializer_class = CarbonCreditSerializer
    permission_classes = [permissions.IsAuthenticated]


class BuyCreditAPIView(generics.GenericAPIView):
    """
    API endpoint for a buyer to purchase a listed credit.
    This action is recorded off-chain.
    """
    permission_classes = [permissions.IsAuthenticated, IsBuyerUser]

    def post(self, request, *args, **kwargs):
        listing_id = self.kwargs.get('pk')
        listing = get_object_or_404(Listing, pk=listing_id)

        if not listing.is_active:
            return Response({"error": "This listing is no longer active."}, status=status.HTTP_400_BAD_REQUEST)

        # Mark listing as sold and transfer ownership
        listing.is_active = False
        listing.save()

        credit = listing.credit
        credit.owner = request.user
        credit.status = CarbonCredit.CreditStatus.SOLD
        credit.save()

        return Response(CarbonCreditSerializer(credit).data)


class ClaimProceedsAPIView(generics.GenericAPIView):
    """
    API endpoint for a seller to claim proceeds from a sale.
    (Placeholder - actual fund transfer would be a separate process)
    """
    permission_classes = [permissions.IsAuthenticated, IsSellerUser]

    def post(self, request, *args, **kwargs):
        listing_id = self.kwargs.get('pk')
        listing = get_object_or_404(Listing, pk=listing_id, seller=request.user)

        if listing.claimed:
            return Response({"error": "Proceeds for this listing have already been claimed."}, status=status.HTTP_400_BAD_REQUEST)

        listing.claimed = True
        listing.save()

        serializer = ListingSerializer(listing)
        return Response(serializer.data)

class WithdrawCreditAPIView(generics.GenericAPIView):
    """
    API endpoint for a seller to withdraw their unsold listing.
    """
    permission_classes = [permissions.IsAuthenticated, IsSellerUser]

    def post(self, request, *args, **kwargs):
        listing_id = self.kwargs.get('pk')
        listing = get_object_or_404(Listing, pk=listing_id, credit__owner=request.user)

        if not listing.is_active:
            return Response({"error": "This listing is not active."}, status=status.HTTP_400_BAD_REQUEST)

        listing.is_active = False
        listing.save()

        return Response({"message": "Listing has been withdrawn."})