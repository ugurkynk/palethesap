import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { Truck, SunMoon, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [showHelp, setShowHelp] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <header className="bg-primary-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Kompozit Panel Yükleme Planlama Sistemi
            </h1>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-white hover:text-primary-200 hover:bg-primary-700"
              >
                <SunMoon className="h-5 w-5" />
                <span className="sr-only">Tema Değiştir</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelp(true)}
                className="text-white hover:text-primary-200 hover:bg-primary-700"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Yardım</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kompozit Panel Yükleme Planlama Sistemi Yardım</DialogTitle>
            <DialogDescription>
              Bu uygulama, kompozit panel yüklemelerini optimize etmenize yardımcı olur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">Nasıl Kullanılır?</h3>
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <span className="font-medium">Araç Tipi Seçin:</span> Standart konteyner tiplerinden birini seçin veya özel ölçüler girin.
                </li>
                <li>
                  <span className="font-medium">Panel Bilgilerini Girin:</span> Renk, core tipi, boyutlar ve adet bilgilerini girin.
                </li>
                <li>
                  <span className="font-medium">Panel Ekleyin:</span> "Panel Ekle" butonu ile panelleri listeye ekleyin.
                </li>
                <li>
                  <span className="font-medium">Yükleme Planı Hesaplayın:</span> "Yükleme Planı Hesapla" butonuna tıklayarak optimal yükleme planını görüntüleyin.
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-lg">Temel Özellikler</h3>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Otomatik hacim ve ağırlık hesaplaması</li>
                <li>Farklı panel türlerini destekleme</li>
                <li>Görsel yükleme planı</li>
                <li>JSON veri içe/dışa aktarma</li>
                <li>Yükleme istatistikleri (hacim, ağırlık, kapasite vb.)</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
