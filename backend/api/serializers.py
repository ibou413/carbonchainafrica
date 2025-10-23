from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, CarbonCredit, Listing
from users.models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'hedera_account_id']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'profile']

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    verifier = UserSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'location', 'tonnage', 'vintage', 'status', 
            'projectId', 'metadata_cid', 'image_cid', 'document_cid', 'created_at', 'updated_at', 'owner', 'verifier'
        ]
        read_only_fields = ['status', 'owner', 'verifier']

    def create(self, validated_data):
        project = Project.objects.create(owner=self.context['request'].user, **validated_data)
        return project

class ProjectVerificationSerializer(serializers.ModelSerializer):
    serial_number = serializers.IntegerField(required=False)
    token_address = serializers.CharField(max_length=255, required=False)

    class Meta:
        model = Project
        fields = ['status', 'serial_number', 'token_address']

    def validate_status(self, value):
        if value not in [Project.ProjectStatus.APPROVED, Project.ProjectStatus.REJECTED]:
            raise serializers.ValidationError("Verifier can only set the status to 'Approved' or 'Rejected'.")
        return value

class SetTokenIdSerializer(serializers.Serializer):
    token_id = serializers.CharField(max_length=255)

class CarbonCreditSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = CarbonCredit
        fields = '__all__'

class ListingSerializer(serializers.ModelSerializer):
    credit = CarbonCreditSerializer(read_only=True)
    seller = UserSerializer(read_only=True)

    class Meta:
        model = Listing
        fields = '__all__'

class ListingCreateSerializer(serializers.ModelSerializer):
    credit = serializers.PrimaryKeyRelatedField(queryset=CarbonCredit.objects.all())

    class Meta:
        model = Listing
        fields = ['credit', 'price']

    def validate_credit(self, credit):
        request_user = self.context['request'].user
        if credit.owner != request_user:
            raise serializers.ValidationError("You do not own this credit.")
        if credit.status != CarbonCredit.CreditStatus.MINTED:
            raise serializers.ValidationError("This credit is not available for sale.")
        return credit

    def create(self, validated_data):
        credit = validated_data['credit']
        # Assign the current user as the seller
        listing = Listing.objects.create(seller=self.context['request'].user, **validated_data)
        credit.status = CarbonCredit.CreditStatus.LISTED
        credit.save()
        return listing
