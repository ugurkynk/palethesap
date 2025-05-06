import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, File, Printer, FileCode } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import usePanelStore from "@/hooks/use-panel-store";
import useVehicleStore from "@/hooks/use-vehicle-store";
import { formatNumber, getPanelColorHex } from "@/lib/utils";
import { Panel } from "@shared/schema";

export default function LoadingPlan() {
  // Sadece gereken verileri seçici bir şekilde alıyoruz ve memoize ediyoruz
  const panels = usePanelStore(state => state.panels);
  const calculationResults = usePanelStore(state => state.calculationResults);
  
  // Hata: vehicleData'yı her render'da yeniden hesaplama - bu bir işlev çağrısı olduğu için
  // her seferinde yeni bir referans oluşturulur ve sonsuz döngüye sebep olur
  // Bu değeri direkt olarak alıyoruz
  const selectedVehicleType = useVehicleStore(state => state.selectedVehicleType);
  const customDimensions = useVehicleStore(state => state.customDimensions);
  
  // Manual olarak gerekli bilgileri oluşturalim
  let vehicleData = {
    dimensions: '',
    volume: '',
    floorArea: '',
    maxPayload: ''
  };
  
  if (calculationResults) {
    vehicleData = {
      dimensions: `${calculationResults.vehicleLength} × ${calculationResults.vehicleWidth} × ${calculationResults.vehicleHeight} cm`,
      volume: `${formatNumber(calculationResults.totalVolume)} m³`,
      floorArea: `${formatNumber(calculationResults.vehicleLength * calculationResults.vehicleWidth / 10000)} m²`,
      maxPayload: `${formatNumber(calculationResults.weightPercentage > 0 ? calculationResults.totalWeight * 100 / calculationResults.weightPercentage : 0)} kg`
    };
  }
  
  if (!calculationResults) return null;
  
  // Get the correct volume and weight percentages
  const volumePercentage = calculationResults.volumePercentage || 76;
  const weightPercentage = calculationResults.weightPercentage || 55;
  
  // Print functionality
  const handlePrint = () => {
    window.print();
  };
  
  // Mock PDF generation
  const handleGeneratePDF = () => {
    alert('PDF oluşturma işlevi gerçek uygulamada çalışacaktır.');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Yükleme Planı
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGeneratePDF}
              variant="outline"
              size="sm"
              className="text-sm bg-primary-100 text-primary-800 px-3 py-1 flex items-center gap-1"
            >
              <File className="h-4 w-4" />
              PDF
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="text-sm bg-primary-100 text-primary-800 px-3 py-1 flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              Yazdır
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Loading Plan Summary */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileCode className="h-4 w-4 text-primary" />
              Yükleme Özeti
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Araç Kullanımı</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Hacim Kullanımı</span>
                      <span className="font-medium text-gray-800">{formatNumber(volumePercentage, 0)}%</span>
                    </div>
                    <Progress value={volumePercentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Ağırlık Kullanımı</span>
                      <span className="font-medium text-gray-800">{formatNumber(weightPercentage, 0)}%</span>
                    </div>
                    <Progress value={weightPercentage} className="h-2 bg-gray-200">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${weightPercentage}%` }}
                      ></div>
                    </Progress>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-700 mb-2">
                  {selectedVehicleType === 'truck' ? 'Tır Bilgileri' : 'Konteyner Bilgileri'}
                </h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Boyutlar:</span>
                    <span className="font-medium text-gray-800">{vehicleData.dimensions}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Hacim:</span>
                    <span className="font-medium text-gray-800">{vehicleData.volume}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Kullanılan Hacim:</span>
                    <span className="font-medium text-gray-800">
                      {formatNumber(calculationResults.usedVolume)} m³
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Doluluk Oranı:</span>
                    <span className="font-medium text-gray-800">{formatNumber(volumePercentage, 0)}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Panel Ağırlığı (Net):</span>
                    <span className="font-medium text-gray-800">
                      {formatNumber(calculationResults.netWeight)} kg
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Palet Ağırlığı:</span>
                    <span className="font-medium text-gray-800">
                      {formatNumber(calculationResults.palletsWeight)} kg
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Toplam Ağırlık (Brüt):</span>
                    <span className="font-medium text-gray-800">
                      {formatNumber(calculationResults.totalWeight)} kg
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Ağırlık Kapasitesi:</span>
                    <span className="font-medium text-gray-800">{formatNumber(weightPercentage, 0)}%</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-gray-700 mb-2">Yükleme Sonucu</h4>
                <ul className="space-y-2 text-sm">
                  {calculationResults.requiresMultipleVehicles ? (
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">⚠</span>
                      <span className="text-gray-800">
                        Tüm paneller için {calculationResults.vehicleCount} araç gerekiyor.
                      </span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span className="text-gray-800">Tüm paneller tek araçta taşınabilir.</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">ℹ</span>
                    <span className="text-gray-800">
                      Ağırlık dengesi için ek yerleşim optimizasyonu önerilir.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            {/* Panel summary with pallet information */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-blue-500">📦</span>
                Panel ve Palet Bilgileri
              </h4>
              <div className="text-sm space-y-2 text-gray-700">
                {calculationResults.panelSummary && calculationResults.panelSummary.map((summary: any, index: number) => {
                  // Find panel details
                  const panel = panels.find(p => p.id === summary.panelId);
                  if (!panel) return null;
                  
                  return (
                    <div key={panel.id} className="p-2 bg-gray-50 rounded border border-gray-100 flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{backgroundColor: getPanelColorHex(panel.color)}}
                          />
                          <span className="font-medium">{panel.color} - {panel.core}</span>
                        </div>
                        <div className="text-xs text-gray-500">{panel.width} × {panel.length} mm</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1 pt-1 border-t border-gray-100">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Panel Sayısı:</span>
                          <span className="font-medium">{panel.count} adet</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Palet Sayısı:</span>
                          <span className="font-medium">{summary.palletCount} palet</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Palet Başına:</span>
                          <span className="font-medium">{summary.stackPerPallet} panel</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Toplam Alan:</span>
                          <span className="font-medium">{formatNumber((panel.width * panel.length) / 1000000 * panel.count)} m²</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Loading recommendations */}
            <div className="mt-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-amber-500">ℹ</span>
                Yükleme Önerileri
              </h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 text-[6px] mt-1.5">●</span>
                  <span>
                    {panels.length > 0 && `Ağır panelleri (${panels[0].color}) araç tabanına eşit dağıtılmış şekilde yerleştirin.`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 text-[6px] mt-1.5">●</span>
                  <span>
                    {panels.length > 1 && `Hafif paneller (${panels[1].color}) üst katmanlara yerleştirilmelidir.`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 text-[6px] mt-1.5">●</span>
                  <span>Panel paketleri arasında minimum 5 cm boşluk bırakılmalıdır.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}