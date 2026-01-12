import { useState } from "react";
import {
  useProductReviews,
  useProductReviewStats,
  useUserReview,
  useCreateReview,
  useUpdateReview,
} from "@/hooks/useReviews";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ProductReviewsProps {
  productId: string;
}

const StarRating = ({
  rating,
  onRate,
  size = "md",
}: {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          disabled={!onRate}
          className={onRate ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
        >
          <Star
            className={`${sizeClass} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: reviews, isLoading: reviewsLoading } = useProductReviews(productId);
  const { data: stats } = useProductReviewStats(productId);
  const { data: userReview } = useUserReview(productId, user?.id);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [title, setTitle] = useState(userReview?.title || "");
  const [comment, setComment] = useState(userReview?.comment || "");

  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Inicia sesión para dejar una reseña" });
      return;
    }

    if (rating === 0) {
      toast({ variant: "destructive", title: "Selecciona una calificación" });
      return;
    }

    try {
      if (userReview) {
        await updateReview.mutateAsync({
          id: userReview.id,
          productId,
          rating,
          title: title || undefined,
          comment: comment || undefined,
        });
        toast({ title: "Reseña actualizada" });
      } else {
        await createReview.mutateAsync({
          product_id: productId,
          user_id: user.id,
          rating,
          title: title || undefined,
          comment: comment || undefined,
        });
        toast({ title: "¡Gracias por tu reseña!" });
      }
      setShowForm(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const openEditForm = () => {
    if (userReview) {
      setRating(userReview.rating);
      setTitle(userReview.title || "");
      setComment(userReview.comment || "");
    } else {
      setRating(0);
      setTitle("");
      setComment("");
    }
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-heading">Reseñas de clientes</h3>
        {user && (
          <Button variant="outline" onClick={openEditForm}>
            <MessageSquare className="h-4 w-4 mr-2" />
            {userReview ? "Editar mi reseña" : "Escribir reseña"}
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="text-center">
                <p className="text-5xl font-bold">{stats.averageRating.toFixed(1)}</p>
                <StarRating rating={Math.round(stats.averageRating)} size="lg" />
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.totalReviews} reseña{stats.totalReviews !== 1 && "s"}
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-3">{star}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Progress
                      value={(stats.distribution[star] / stats.totalReviews) * 100}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {stats.distribution[star] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{userReview ? "Editar reseña" : "Escribir reseña"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tu calificación</label>
              <StarRating rating={rating} onRate={setRating} size="lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Título (opcional)</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resume tu experiencia"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tu opinión (opcional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos más sobre tu experiencia con este producto..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={createReview.isPending || updateReview.isPending}
              >
                {(createReview.isPending || updateReview.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {userReview ? "Actualizar" : "Publicar"} reseña
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !reviews?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay reseñas todavía</p>
            <p className="text-sm text-muted-foreground">Sé el primero en opinar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {review.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {review.profiles?.full_name || "Usuario"}
                      </span>
                      {review.is_verified_purchase && (
                        <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded">
                          Compra verificada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "PP", { locale: es })}
                      </span>
                    </div>
                    {review.title && (
                      <p className="font-medium mb-1">{review.title}</p>
                    )}
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
