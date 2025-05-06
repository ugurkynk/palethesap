export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <div>
            <p>© {new Date().getFullYear()} Kompozit Panel Yükleme Planlama Sistemi. Tüm hakları saklıdır.</p>
          </div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Yardım</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Gizlilik Politikası</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">İletişim</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
