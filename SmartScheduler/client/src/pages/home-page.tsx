import Header from "@/components/header";
import VehicleInfo from "@/components/vehicle-info";
import PanelForm from "@/components/panel-form";
import PanelList from "@/components/panel-list";
import LoadingPlan from "@/components/loading-plan";
import Footer from "@/components/footer";
import usePanelStore from "@/hooks/use-panel-store";

export default function HomePage() {
  const isCalculated = usePanelStore(state => state.isCalculated);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Vehicle Info and Panel Form */}
          <div className="lg:col-span-1">
            <VehicleInfo />
            <PanelForm />
          </div>
          
          {/* Right Column: Panel List and Loading Plan */}
          <div className="lg:col-span-2">
            <PanelList />
            {isCalculated && <LoadingPlan key="loading-plan" />}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
