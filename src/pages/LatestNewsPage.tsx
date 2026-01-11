import LatestNews from '../components/LatestNews';
import SocialMediaBar from '../components/navigation/SocialMediaBar';
import MainNavigation from '../components/navigation/MainNavigation';

export default function LatestNewsPage() {
  // Dummy handler for donation modal (replace with actual if needed)
  const openDonationModal = () => {};
  return (
    <>
      <SocialMediaBar />
      <MainNavigation openDonationModal={openDonationModal} />
      <div className="min-h-screen bg-gray-100">
        <LatestNews showAll={true}/>
      </div>
    </>
  );
}
