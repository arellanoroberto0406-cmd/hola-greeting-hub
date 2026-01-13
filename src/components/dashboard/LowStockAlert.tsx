import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Product {
  id: string;
  name: string;
  stock: number;
  image: string;
}

interface LowStockAlertProps {
  products: Product[];
  lowStockThreshold?: number;
  onEditProduct?: (productId: string) => void;
  primaryColor?: string;
}

const LowStockAlert = ({ 
  products, 
  lowStockThreshold = 5, 
  onEditProduct,
  primaryColor = "#8B4513"
}: LowStockAlertProps) => {
  const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  
  const hasAlerts = lowStockProducts.length > 0 || outOfStockProducts.length > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Alertas de Inventario</CardTitle>
            <CardDescription>
              {outOfStockProducts.length > 0 && (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {outOfStockProducts.length} sin stock
                </span>
              )}
              {outOfStockProducts.length > 0 && lowStockProducts.length > 0 && " · "}
              {lowStockProducts.length > 0 && (
                <span className="text-orange-600 dark:text-orange-400">
                  {lowStockProducts.length} con stock bajo
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <div className="space-y-2">
            {/* Out of stock products */}
            {outOfStockProducts.map((product) => (
              <div 
                key={product.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <Badge variant="destructive" className="text-xs">
                    Sin stock
                  </Badge>
                </div>
                {onEditProduct && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditProduct(product.id)}
                    className="shrink-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {/* Low stock products */}
            {lowStockProducts.map((product) => (
              <div 
                key={product.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      {product.stock} unidades
                    </span>
                  </div>
                </div>
                {onEditProduct && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditProduct(product.id)}
                    className="shrink-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
