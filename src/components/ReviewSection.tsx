"use client";

import { useState, useEffect } from "react";
import { Star, Send, User, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import "./ReviewSection.css";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewSection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    const newReview = {
      product_id: productId,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Anonymous",
      rating,
      comment,
    };

    const { error } = await supabase.from('reviews').insert([newReview]);

    if (!error) {
      setComment("");
      setRating(5);
      fetchReviews();
    } else {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Make sure the 'reviews' table is created in Supabase!");
    }
    setIsSubmitting(false);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <section className="review-section">
      <div className="review-header">
        <div className="review-stats">
          <h2 className="section-title">Customer Reviews</h2>
          <div className="rating-summary">
            <div className="avg-box">
              <span className="avg-num">{averageRating}</span>
              <div className="avg-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(Number(averageRating)) ? "var(--accent-color)" : "none"}
                    color={s <= Math.round(Number(averageRating)) ? "var(--accent-color)" : "#cbd5e1"}
                  />
                ))}
              </div>
            </div>
            <p className="total-reviews">{reviews.length} total reviews</p>
          </div>
        </div>

        {user ? (
          <form className="review-form glass-panel" onSubmit={handleSubmit}>
            <h3>Write a Review</h3>
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="star-btn"
                >
                  <Star
                    size={28}
                    fill={(hoverRating || rating) >= s ? "var(--accent-color)" : "none"}
                    color={(hoverRating || rating) >= s ? "var(--accent-color)" : "#94a3b8"}
                  />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
            <button type="submit" className="btn btn-primary submit-review-btn" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : <><Send size={18} /> Post Review</>}
            </button>
          </form>
        ) : (
          <div className="login-to-review glass-panel">
            <MessageCircle size={32} color="var(--primary-color)" />
            <p>Please sign in to share your review</p>
          </div>
        )}
      </div>

      <div className="reviews-list">
        {isLoading ? (
          <div className="loading-reviews">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r.id} className="review-item animate-fade-in">
              <div className="review-meta">
                <div className="user-avatar">
                  <User size={18} />
                </div>
                <div className="user-info">
                  <span className="user-name">{r.user_name}</span>
                  <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="item-rating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= r.rating ? "var(--accent-color)" : "none"}
                      color={s <= r.rating ? "var(--accent-color)" : "#cbd5e1"}
                    />
                  ))}
                </div>
              </div>
              <p className="review-text">{r.comment}</p>
            </div>
          ))
        ) : (
          <div className="empty-reviews">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </section>
  );
}
