import { useRef, useEffect } from "react";
import { LoadingPlanData, PanelData, PalletPosition } from "@shared/schema";
import { getPanelColorHex } from "@/lib/utils";

interface VisualizationProps {
  data: LoadingPlanData;
  panels: PanelData[];
}

export default function Visualization({ data, panels }: VisualizationProps) {
  const topViewRef = useRef<HTMLDivElement>(null);
  const sideViewRef = useRef<HTMLDivElement>(null);
  
  // 1. KUŞBAKIŞI GÖRÜNÜM (Araç Geneli) - ÜSTTEN GÖRÜNÜM
  useEffect(() => {
    if (!topViewRef.current || !data || !data.pallets || !Array.isArray(data.pallets)) {
      console.log("Kuşbakışı görünüm verisi eksik.");
      return;
    }
    
    // Container temizle
    const container = topViewRef.current;
    container.innerHTML = '';
    
    // Araç boyutları (cm)
    const vehicleWidth = data.vehicleWidth;
    const vehicleLength = data.vehicleLength;
    
    // Ölçekleme faktoru (cm -> pixel) - konteyner boyutlarına uygun hale getir
    const scale = 0.3; // Biraz daha büyük ölçek kullanalım
    
    // Başlık ekle
    const title = document.createElement('div');
    title.textContent = 'Kuşbakışı Görünüm - Üst Görünüm (TIR)'; 
    title.style.fontWeight = 'bold';
    title.style.fontSize = '14px';
    title.style.marginBottom = '10px';
    title.style.textAlign = 'center';
    container.appendChild(title);
    
    // Ana araç görselini oluştur - 90 derece döndürülüyor
    const vehicleContainer = document.createElement('div');
    vehicleContainer.style.position = 'relative';
    // Genişlik ve uzunluğu ters çevirerek 90 derece dönderme etkisi
    vehicleContainer.style.width = `${vehicleLength * scale}px`; // Uzunluk -> Genişlik
    vehicleContainer.style.height = `${vehicleWidth * scale}px`; // Genişlik -> Yükseklik
    vehicleContainer.style.border = '2px solid #333';
    vehicleContainer.style.backgroundColor = '#f5f5f5';
    vehicleContainer.style.margin = '0 auto';
    vehicleContainer.style.marginTop = '30px';
    vehicleContainer.style.transition = 'all 0.3s ease';
    vehicleContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    vehicleContainer.style.maxWidth = '95%';
    vehicleContainer.style.maxHeight = '280px';
    
    // Araç boyutları etiketini ekle
    const dimensionsLabel = document.createElement('div');
    dimensionsLabel.style.position = 'absolute';
    dimensionsLabel.style.top = '-25px';
    dimensionsLabel.style.left = '0';
    dimensionsLabel.style.width = '100%';
    dimensionsLabel.style.textAlign = 'center';
    dimensionsLabel.style.fontSize = '12px';
    dimensionsLabel.style.color = '#555';
    dimensionsLabel.textContent = `Araç Boyutları: ${vehicleLength} cm (U) x ${vehicleWidth} cm (G)`;
    vehicleContainer.appendChild(dimensionsLabel);
    
    // Panel tiplerine göre gruplama ve yerleşim mantığını basitleştirme
    // İki tip panel için 2x4 (4 üzeri 2) ve 2x4 (4 üzeri 2) yerleşim
    
    // İlk olarak panelleri tiplere göre grupla
    const panelGroups: {[key: number]: PalletPosition[]} = {};
    data.pallets.forEach(pallet => {
      if (!panelGroups[pallet.panelId]) {
        panelGroups[pallet.panelId] = [];
      }
      panelGroups[pallet.panelId].push(pallet);
    });
    
    console.log(`Kuşbakışı görünüm: ${Object.keys(panelGroups).length} panel tipi, ${data.pallets.length} palet`);
    
    // Araç içindeki boş alanı hesapla ve böl
    const vehicleLengthPixels = vehicleLength * scale;
    const vehicleWidthPixels = vehicleWidth * scale;
    
    // Panel gruplarını işle
    const panelTypes = Object.keys(panelGroups);
    
    // Her panel tipi için yükleme alanı bölümlemesi - her tür için 2 sıra, 4 kolon
    panelTypes.forEach((panelIdStr, typeIndex) => {
      const panelId = Number(panelIdStr);
      const panel = panels.find(p => p.id === panelId);
      const pallets = panelGroups[panelId];
      
      if (!panel || !pallets || pallets.length === 0) return;
      
      console.log(`Yerleştiriliyor: ${panel.color} ${panel.core} - ${pallets.length} palet`);
      
      // Bölge başlangıç noktası hesapla
      // En fazla 2 panel tipi için, araç uzunluğu boyunca böl
      const sectionWidth = vehicleLengthPixels / Math.min(panelTypes.length, 2);
      const sectionStartX = typeIndex * sectionWidth;
      
      // Her panel tipi için 2x4 grid mantığı (2 satır, 4 sütun)
      // Her bir palet için konumu belirle
      const gridRowCount = 2; 
      const gridColCount = 4;
      
      // Hücre boyutları
      const cellWidth = sectionWidth / gridColCount;
      const cellHeight = vehicleWidthPixels / gridRowCount;
      
      // Her paleti grid içinde yerleştir
      pallets.slice(0, gridRowCount * gridColCount).forEach((pallet, index) => {
        // Grid pozisyonu hesapla
        const row = Math.floor(index / gridColCount);
        const col = index % gridColCount;
        
        // Palet div'ini oluştur
        const palletElement = document.createElement('div');
        palletElement.className = 'pallet-top-view';
        palletElement.style.position = 'absolute';
        
        // Palet pozisyonları - grid hücrelerine göre
        const palletLeft = sectionStartX + (col * cellWidth);
        const palletTop = row * cellHeight;
        
        // Palet boyutunu hücre boyutuna göre ayarla - biraz boşluk bırak
        const palletWidth = cellWidth * 0.9;
        const palletHeight = cellHeight * 0.9;
        
        // Görselleştirme için CSS ayarla
        palletElement.style.width = `${palletWidth}px`;
        palletElement.style.height = `${palletHeight}px`;
        palletElement.style.top = `${palletTop + (cellHeight - palletHeight) / 2}px`; // Ortala
        palletElement.style.left = `${palletLeft + (cellWidth - palletWidth) / 2}px`; // Ortala
        palletElement.style.backgroundColor = `${getPanelColorHex(panel.color)}CC`; // Renk + %80 opasite
        palletElement.style.border = '1px solid rgba(0,0,0,0.3)';
        palletElement.style.boxSizing = 'border-box';
        palletElement.style.borderRadius = '2px';
        palletElement.style.fontSize = '9px';
        palletElement.style.overflow = 'hidden';
        palletElement.style.color = '#000';
        palletElement.style.textAlign = 'center';
        palletElement.style.padding = '2px';
        
        // Palet bilgisi
        palletElement.innerHTML = `
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${panel.color}<br>
            ${panel.core}<br>
            <span style="font-size:8px">${pallet.count} adet</span>
          </div>
        `;
        
        // Palet tabanı görseli ekle
        const palletBase = document.createElement('div');
        palletBase.style.position = 'absolute';
        palletBase.style.bottom = '0';
        palletBase.style.left = '0';
        palletBase.style.width = '100%';
        palletBase.style.height = '4px';
        palletBase.style.backgroundColor = '#8B4513'; // Kahverengi palet taban rengi
        palletElement.appendChild(palletBase);
        
        // Palet görünümünü araç içine yerleştir
        vehicleContainer.appendChild(palletElement);
        
        // Grid çizgilerini ekle (opsiyonel)
        const gridLine = document.createElement('div');
        gridLine.style.position = 'absolute';
        gridLine.style.top = `${row * cellHeight}px`;
        gridLine.style.left = `${sectionStartX + (col * cellWidth)}px`;
        gridLine.style.width = `${cellWidth}px`;
        gridLine.style.height = `${cellHeight}px`;
        gridLine.style.border = '1px dashed rgba(0,0,0,0.1)';
        gridLine.style.boxSizing = 'border-box';
        gridLine.style.pointerEvents = 'none';
        gridLine.style.zIndex = '1';
        vehicleContainer.appendChild(gridLine);
      });
      
      // Panel grubu için bir etiket ekle
      const groupLabel = document.createElement('div');
      groupLabel.style.position = 'absolute';
      groupLabel.style.top = `${-20}px`;
      groupLabel.style.left = `${sectionStartX}px`;
      groupLabel.style.width = `${sectionWidth}px`;
      groupLabel.style.textAlign = 'center';
      groupLabel.style.fontSize = '11px';
      groupLabel.style.fontWeight = 'bold';
      groupLabel.style.color = '#555';
      groupLabel.textContent = `${panel.color} ${panel.core} - ${pallets.length} palet`;
      vehicleContainer.appendChild(groupLabel);
    });
    
    container.appendChild(vehicleContainer);
    
    // Bilgi etiketi ekle
    const infoLabel = document.createElement('div');
    infoLabel.style.fontSize = '11px';
    infoLabel.style.color = '#777';
    infoLabel.style.textAlign = 'center';
    infoLabel.style.marginTop = '10px';
    infoLabel.textContent = `Toplam Kullanılan Alan: %${Math.round(data.volumePercentage)} | Paletler: ${data.pallets.length} adet`;
    container.appendChild(infoLabel);
  }, [data, panels]);
  
  // 2. YANDAN GÖRÜNÜM - PALET YIGINLARI
  useEffect(() => {
    if (!sideViewRef.current || !data || !data.pallets || !Array.isArray(data.pallets)) {
      console.log("Yan görünüm verisi eksik.");
      return;
    }
    
    // Container temizle
    const container = sideViewRef.current;
    container.innerHTML = '';
    
    // Araç boyutları (cm)
    const vehicleLength = data.vehicleLength;
    const vehicleHeight = data.vehicleHeight;
    
    // Ölçekleme faktoru (cm -> pixel)
    const scale = 0.3;
    
    // Başlık ekle
    const title = document.createElement('div');
    title.textContent = 'Yan Görünüm - 4 Üzeri 2 Yükleme Planı'; 
    title.style.fontWeight = 'bold';
    title.style.fontSize = '14px';
    title.style.marginBottom = '10px';
    title.style.textAlign = 'center';
    container.appendChild(title);
    
    // Araç ana konteynerini oluştur
    const vehicleContainer = document.createElement('div');
    vehicleContainer.style.position = 'relative';
    vehicleContainer.style.width = `${vehicleLength * scale}px`;
    vehicleContainer.style.height = `${vehicleHeight * scale}px`;
    vehicleContainer.style.border = '2px solid #333';
    vehicleContainer.style.backgroundColor = '#f5f5f5';
    vehicleContainer.style.margin = '0 auto';
    vehicleContainer.style.marginTop = '30px';
    vehicleContainer.style.transition = 'all 0.3s ease';
    vehicleContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    vehicleContainer.style.maxWidth = '95%';
    vehicleContainer.style.maxHeight = '280px';
    
    // Araç boyutları etiketini ekle
    const dimensionsLabel = document.createElement('div');
    dimensionsLabel.style.position = 'absolute';
    dimensionsLabel.style.top = '-25px';
    dimensionsLabel.style.left = '0';
    dimensionsLabel.style.width = '100%';
    dimensionsLabel.style.textAlign = 'center';
    dimensionsLabel.style.fontSize = '12px';
    dimensionsLabel.style.color = '#555';
    dimensionsLabel.textContent = `Araç Boyutları: ${vehicleLength} cm (U) x ${vehicleHeight} cm (Y)`;
    vehicleContainer.appendChild(dimensionsLabel);
    
    // Panel tiplerini grupla
    const panelGroups: {[key: number]: PalletPosition[]} = {};
    data.pallets.forEach(pallet => {
      if (!panelGroups[pallet.panelId]) {
        panelGroups[pallet.panelId] = [];
      }
      panelGroups[pallet.panelId].push(pallet);
    });
    
    // Yan görünüm için sabit 4x2 (4 sütun, 2 satır) yerleşim düzeni oluştur
    const totalGroups = Object.keys(panelGroups).length;
    const groupWidth = vehicleLength * scale / totalGroups;
    
    // Her panel tipi için 4 alt sütun halinde yükleme alanı oluştur
    Object.entries(panelGroups).forEach(([panelIdStr, pallets], groupIndex) => {
      const panelId = Number(panelIdStr);
      const panel = panels.find(p => p.id === panelId);
      if (!panel) return;
      
      console.log(`Yan görünüm yerleştiriliyor: ${panel.color} ${panel.core} - ${pallets.length} palet`);
      
      // Panel tipi için başlangıç X pozisyonu
      const groupStartX = groupIndex * groupWidth;
      
      // Panel tip bilgisini göster
      const panelLabel = document.createElement('div');
      panelLabel.style.position = 'absolute';
      panelLabel.style.top = '-40px';
      panelLabel.style.left = `${groupStartX}px`;
      panelLabel.style.width = `${groupWidth}px`;
      panelLabel.style.textAlign = 'center';
      panelLabel.style.fontSize = '11px';
      panelLabel.style.fontWeight = 'bold';
      panelLabel.style.color = '#333';
      panelLabel.innerHTML = `${panel.color} ${panel.core} - ${pallets.length} palet`;
      vehicleContainer.appendChild(panelLabel);
      
      // 4x2 düzeni için sabit grid oluştur (4 sütun, 2 sıra)
      const columnCount = 4;
      const rowCount = 2;
      
      // Hücre boyutları
      const columnWidth = groupWidth / columnCount;
      
      // Paletleri sırala (boyuta göre, büyükten küçüğe)
      pallets.sort((a, b) => (b.palletWidth * b.palletLength) - (a.palletWidth * a.palletLength));
      
      // Maksimum 8 palet yerleştir (4 sütun x 2 sıra)
      pallets.slice(0, columnCount * rowCount).forEach((pallet, index) => {
        // Hangi sütun ve sırada olacağını hesapla
        const column = index % columnCount; // 0-3 arası değer (sütun indeksi)
        const row = Math.floor(index / columnCount); // 0-1 arası değer (sıra indeksi)
        
        // Palet elemanini oluştur
        const palletElement = document.createElement('div');
        palletElement.className = 'pallet-side-view';
        palletElement.style.position = 'absolute';
        
        // Palet boyutları ve konumu - yatay grupta düzgün yerleşim
        const palletWidth = columnWidth * 0.9;
        const palletHeight = (vehicleHeight * scale * 0.43); // Yüksekliğin yaklaşık %43'ü
        
        // X ve Y konumları hesapla
        const palletX = groupStartX + (column * columnWidth) + (columnWidth * 0.05); // Sütuna göre yatay konum
        const palletY = row * (vehicleHeight * scale * 0.45); // Sıraya göre dikey konum (alt sıra - üst sıra)
        
        // Görsel özellikleri ayarla
        palletElement.style.width = `${palletWidth}px`;
        palletElement.style.height = `${palletHeight}px`;
        palletElement.style.left = `${palletX}px`;
        palletElement.style.top = `${palletY}px`; // Üst kenardan aşağıya
        palletElement.style.backgroundColor = `${getPanelColorHex(panel.color)}CC`;
        palletElement.style.border = '1px solid rgba(0,0,0,0.3)';
        palletElement.style.borderRadius = '3px';
        palletElement.style.boxSizing = 'border-box';
        palletElement.style.fontSize = '10px';
        palletElement.style.overflow = 'hidden';
        palletElement.style.color = '#000';
        palletElement.style.textAlign = 'center';
        palletElement.style.padding = '3px';
        
        // Palet için palet tabanı (gerçek palet görseli)
        const palletBase = document.createElement('div');
        palletBase.style.position = 'absolute';
        palletBase.style.bottom = '0';
        palletBase.style.left = '0';
        palletBase.style.width = '100%';
        palletBase.style.height = '8px';
        palletBase.style.backgroundColor = '#8B4513';
        palletBase.style.borderTop = '1px solid #333';
        palletElement.appendChild(palletBase);
        
        // Palet bilgisi
        palletElement.innerHTML += `
          <div style="margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${panel.color}<br>
            ${panel.core}<br>
            ${pallet.count} adet
          </div>
        `;
        
        // Palet pozisyon indeksi göster (Opsiyonel)
        const positionLabel = document.createElement('div');
        positionLabel.style.position = 'absolute';
        positionLabel.style.right = '2px';
        positionLabel.style.top = '2px';
        positionLabel.style.fontSize = '8px';
        positionLabel.style.color = 'rgba(0,0,0,0.5)';
        positionLabel.textContent = `${row+1}-${column+1}`; // 1-1, 1-2, 1-3, 1-4, 2-1, 2-2, 2-3, 2-4 formatında
        palletElement.appendChild(positionLabel);
        
        // Yükseklik etiketi (opsiyonel)
        const heightLabel = document.createElement('div');
        heightLabel.style.position = 'absolute';
        heightLabel.style.left = '2px';
        heightLabel.style.bottom = '10px';
        heightLabel.style.fontSize = '7px';
        heightLabel.style.color = 'rgba(0,0,0,0.7)';
        heightLabel.textContent = `${pallet.stackHeight} cm`;
        palletElement.appendChild(heightLabel);
        
        // Elemanları ana konteynere ekle
        vehicleContainer.appendChild(palletElement);
      });
    });
    
    container.appendChild(vehicleContainer);
    
    // Alt bilgi ekle
    const stackInfo = document.createElement('div');
    stackInfo.style.fontSize = '11px';
    stackInfo.style.color = '#777';
    stackInfo.style.textAlign = 'center';
    stackInfo.style.marginTop = '10px';
    stackInfo.textContent = `Toplam Yükseklik Kullanımı: %${Math.round(data.volumePercentage)} | Toplam Ağırlık: ${Math.round(data.totalWeight)} kg`;
    container.appendChild(stackInfo);
    
    if (data.requiresMultipleVehicles) {
      const warningLabel = document.createElement('div');
      warningLabel.style.fontSize = '12px';
      warningLabel.style.color = '#d63031';
      warningLabel.style.textAlign = 'center';
      warningLabel.style.marginTop = '5px';
      warningLabel.style.fontWeight = 'bold';
      warningLabel.textContent = `Uyarı: Yükleme için ${data.vehicleCount} araç gerekmektedir!`;
      container.appendChild(warningLabel);
    }
    
  }, [data, panels]);
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Kuşbakışı görünüm (Araç geneli) */}
      <div>
        <div 
          ref={topViewRef}
          className="loading-plan-top-view"
          style={{ height: '300px', width: '100%', position: 'relative' }}
        >
          {/* Dinamik içerik eklenecek */}
        </div>
      </div>
      
      {/* Yan görünüm (Paletler) */}
      <div>
        <div 
          ref={sideViewRef}
          className="loading-plan-side-view"
          style={{ height: '300px', width: '100%', position: 'relative' }}
        >
          {/* Dinamik içerik eklenecek */}
        </div>
      </div>
    </div>
  );
}