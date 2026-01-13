import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProductReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

const ProductReviewForm = ({ productId, onSuccess }: ProductReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Debes iniciar sesión para dejar una reseña");
      
      const { error } = await supabase
        .from("reviews")
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
        });
      
      if (error) {
        if (error.code === "23505") {
          throw new Error("Ya has dejado una reseña para este producto");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "¡Gracias por tu reseña!" });
      setRating(5);
      setTitle("");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">Inicia sesión para dejar una reseña</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Escribe una reseña</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Calificación</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Título (opcional)</Label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resumen de tu experiencia"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Tu reseña</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia con este producto..."
            rows={4}
          />
        </div>
        
        <Button 
          onClick={() => submitReview.mutate()} 
          disabled={submitReview.isPending}
          className="w-full"
        >
          {submitReview.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Publicar reseña
        </Button>
      </CardContent>
    </Card>
  );
};

interface ReviewsListProps {
  productId: string;
  storeColor?: string;
}

const ReviewsList = ({ productId, storeColor }: ReviewsListProps) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: storeColor }} />
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No hay reseñas todavía</p>
        <p className="text-sm">¡Sé el primero en dejar tu opinión!</p>
      </div>
    );
  }

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: storeColor }}>
            {averageRating.toFixed(1)}
          </div>
          <div className="flex gap-0.5 justify-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.length} reseña{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star, idx) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3">{star}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${(ratingCounts[idx] / reviews.length) * 100}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground">{ratingCounts[idx]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((review: any) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: storeColor }}
                >
                  {review.profiles?.full_name?.charAt(0)?.toUpperCase() || 
                   review.profiles?.email?.charAt(0)?.toUpperCase() || 
                   <User className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {review.profiles?.full_name || "Usuario anónimo"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "d MMM yyyy", { locale: es })}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <h4 className="font-medium mt-2">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-muted-foreground mt-1">{review.comment}</p>
                  )}
                  {review.is_verified_purchase && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      ✓ Compra verificada
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface ProductReviewSectionProps {
  productId: string;
  storeColor?: string;
}

const ProductReviewSection = ({ productId, storeColor }: ProductReviewSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-heading font-bold">Reseñas de clientes</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReviewsList productId={productId} storeColor={storeColor} />
        </div>
        <div>
          <ProductReviewForm productId={productId} />
        </div>
      </div>
    </div>
  );
};

export default ProductReviewSection;
