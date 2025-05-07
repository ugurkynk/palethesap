import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, ListChecks } from "lucide-react";
import usePanelStore from "@/hooks/use-panel-store";
import { formatNumber, getPanelColorHex } from "@/lib/utils";
import { PanelData } from "@shared/schema";

export default function PanelList() {
  // Zustand store'dan her bilesen icin ayri selector kullanmak daha verimli
  const panels = usePanelStore(state => state.panels);
  const removePanel = usePanelStore(state => state.removePanel);
  const editPanel = usePanelStore(state => state.editPanel);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Panel Listesi
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Toplam: </span>
            <span className="font-medium bg-primary-100 text-primary-800 px-2 py-0.5 rounded-md">
              {panels.length} çeşit
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {panels.length > 0 ? (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase">Renk</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase">Core</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase">Boyutlar (mm)</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase">Kalınlık</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase">Adet</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase">Toplam m²</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase">Ağırlık (kg)</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {panels.map((panel) => (
                  <TableRow key={panel.id} className="panel-item hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300 mr-2" 
                          style={{ backgroundColor: getPanelColorHex(panel.color) }}
                        ></div>
                        <span className="text-sm text-gray-900">{panel.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{panel.core}</TableCell>
                    <TableCell className="text-sm text-gray-500">{panel.width} × {panel.length}</TableCell>
                    <TableCell className="text-sm text-gray-500">{panel.thickness} mm</TableCell>
                    <TableCell className="text-sm text-gray-500">{panel.count}</TableCell>
                    <TableCell className="text-sm text-gray-500">{formatNumber(panel.totalArea)} m²</TableCell>
                    <TableCell className="text-sm text-gray-500">{formatNumber(panel.totalWeight)} kg</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-600 hover:text-primary-900 h-8 w-8 p-0"
                        onClick={() => editPanel(panel.id)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Düzenle</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900 h-8 w-8 p-0"
                        onClick={() => removePanel(panel.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Sil</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <ListChecks className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>Henüz panel eklenmemiş. Panel eklemek için formu kullanın.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
