from django.urls import path
from .views import (
    ProjectListCreateAPIView,
    MyProjectListAPIView,
    PendingProjectListAPIView,
    VerifierDashboardListAPIView,
    ProjectDetailAPIView,
    ProjectReviewAPIView,
    ListingListCreateAPIView,
    MyListingsAPIView,
    UserNFTListView,
    NFTDetailView,
    BuyCreditAPIView,
    ClaimProceedsAPIView,
    WithdrawCreditAPIView,
)

app_name = 'api'

urlpatterns = [
    path('projects/', ProjectListCreateAPIView.as_view(), name='project-list-create'),
    path('projects/my-projects/', MyProjectListAPIView.as_view(), name='my-project-list'),
    path('projects/pending-review/', PendingProjectListAPIView.as_view(), name='pending-project-list'),
    path('projects/verifier-dashboard/', VerifierDashboardListAPIView.as_view(), name='verifier-dashboard-list'),
    path('projects/<int:pk>/', ProjectDetailAPIView.as_view(), name='project-detail'),
    path('projects/<int:pk>/review/', ProjectReviewAPIView.as_view(), name='project-review'),
    path('listings/', ListingListCreateAPIView.as_view(), name='listing-list-create'),
    path('listings/my-listings/', MyListingsAPIView.as_view(), name='my-listings'),

    # NFT Management
    path('nfts/my-nfts/', UserNFTListView.as_view(), name='user-nft-list'),
    path('nfts/<int:pk>/', NFTDetailView.as_view(), name='nft-detail'),

    # Marketplace Interactions
    path('listings/<int:pk>/buy/', BuyCreditAPIView.as_view(), name='buy-credit'),
    path('listings/<int:pk>/claim/', ClaimProceedsAPIView.as_view(), name='claim-proceeds'),
    path('listings/<int:pk>/withdraw/', WithdrawCreditAPIView.as_view(), name='withdraw-credit'),
]