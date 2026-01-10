# 🎨 Ý Tưởng Thiết Kế UI cho Trang Showcase

## 📋 Tổng Quan

Dựa trên thiết kế hiện tại của bạn (FarmShowcase.tsx), tôi đề xuất mở rộng với các tính năng mới:

### ✅ Đã có:
- ✅ Trang chủ showcase với hero image
- ✅ Navigation bar với 3 tabs: Trang chủ, Sản phẩm, Tin tức
- ✅ Gallery hình ảnh
- ✅ Thông tin liên hệ

### 🆕 Cần thêm:
- 🆕 Chi tiết sản phẩm với đánh giá & bình luận
- 🆕 Hệ thống rating (1-5 sao)
- 🆕 Nested comments (trả lời bình luận)
- 🆕 Reactions (like, love, haha, wow, sad, angry)
- 🆕 Form đăng nhập/đăng ký
- 🆕 Chi tiết bài viết blog với bình luận

---

## 🎯 1. TRANG CHI TIẾT SẢN PHẨM

### Layout Structure:
```
┌─────────────────────────────────────────────────────────┐
│ [Navigation Bar]                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │              │  │ Tên sản phẩm                  │   │
│  │  Hình ảnh    │  │ ⭐⭐⭐⭐⭐ (4.8) - 24 đánh giá │   │
│  │  Chính       │  │                               │   │
│  │              │  │ Giá: 150,000đ                 │   │
│  │              │  │ Còn hàng: 100 kg              │   │
│  └──────────────┘  │                               │   │
│  [Thumb] [Thumb]   │ [Thêm vào giỏ] [Mua ngay]    │   │
│  [Thumb] [Thumb]   └──────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Mô tả sản phẩm                                  │   │
│  │ Lorem ipsum dolor sit amet...                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ĐÁNH GIÁ & NHẬN XÉT                             │   │
│  │                                                  │   │
│  │ Tổng quan:                                       │   │
│  │ ⭐⭐⭐⭐⭐ 4.8/5 (24 đánh giá)                    │   │
│  │ 5⭐ ████████████████░░ 18                       │   │
│  │ 4⭐ ████░░░░░░░░░░░░░░ 4                        │   │
│  │ 3⭐ ██░░░░░░░░░░░░░░░░ 2                        │   │
│  │ 2⭐ ░░░░░░░░░░░░░░░░░░ 0                        │   │
│  │ 1⭐ ░░░░░░░░░░░░░░░░░░ 0                        │   │
│  │                                                  │   │
│  │ [Viết đánh giá]                                  │   │
│  │                                                  │   │
│  │ ┌──────────────────────────────────────────┐    │   │
│  │ │ 👤 Nguyễn Văn A  ⭐⭐⭐⭐⭐  2 ngày trước │    │   │
│  │ │ "Sản phẩm tuyệt vời!"                    │    │   │
│  │ │ Mận rất ngon, tươi, giao hàng nhanh...   │    │   │
│  │ │ [👍 12] [❤️ 5] [😮 2]                    │    │   │
│  │ │ [Hữu ích] [Trả lời]                      │    │   │
│  │ └──────────────────────────────────────────┘    │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ BÌNH LUẬN                                        │   │
│  │                                                  │   │
│  │ [Nhập bình luận của bạn...]                     │   │
│  │ [Gửi]                                            │   │
│  │                                                  │   │
│  │ ┌──────────────────────────────────────────┐    │   │
│  │ │ 👤 Trần Thị B  •  1 giờ trước            │    │   │
│  │ │ Sản phẩm này có ship toàn quốc không?    │    │   │
│  │ │ [👍 2] [❤️ 1]  [Trả lời]                 │    │   │
│  │ │                                           │    │   │
│  │ │   ↳ 👤 Admin  •  30 phút trước            │    │   │
│  │ │     Có ạ, shop ship toàn quốc!           │    │   │
│  │ │     [👍 5] [❤️ 2]  [Trả lời]              │    │   │
│  │ └──────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown:

#### A. Product Image Gallery
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Left: Image Gallery */}
  <div className="flex flex-col gap-4">
    {/* Main Image */}
    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
      <img src={mainImage} className="w-full h-full object-cover" />
    </div>
    
    {/* Thumbnails */}
    <div className="grid grid-cols-4 gap-3">
      {images.map(img => (
        <div className="aspect-square rounded-lg overflow-hidden cursor-pointer 
                        border-2 hover:border-[#13ec49] transition-colors">
          <img src={img} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  </div>
  
  {/* Right: Product Info */}
  <div className="flex flex-col gap-6">
    {/* ... */}
  </div>
</div>
```

#### B. Rating Overview Component
```tsx
<div className="bg-white rounded-2xl border border-gray-200 p-6">
  <h3 className="text-2xl font-bold mb-6">Đánh giá & Nhận xét</h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
    {/* Left: Overall Rating */}
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#13ec49]/10 to-transparent rounded-xl p-6">
      <div className="text-6xl font-black text-[#111813] mb-2">4.8</div>
      <div className="flex gap-1 mb-2">
        {[1,2,3,4,5].map(star => (
          <span className="text-[#13ec49] text-2xl">⭐</span>
        ))}
      </div>
      <p className="text-gray-600">24 đánh giá</p>
    </div>
    
    {/* Right: Rating Breakdown */}
    <div className="flex flex-col gap-2">
      {[5,4,3,2,1].map(star => (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium w-8">{star}⭐</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#13ec49] rounded-full transition-all"
              style={{ width: `${getPercentage(star)}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 w-8">{getCount(star)}</span>
        </div>
      ))}
    </div>
  </div>
  
  <button className="w-full py-3 rounded-xl bg-[#13ec49] text-[#102215] font-bold
                     hover:brightness-110 transition-all">
    Viết đánh giá của bạn
  </button>
</div>
```

#### C. Review Card Component
```tsx
<div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
  {/* Header */}
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      <img src={avatar} className="w-12 h-12 rounded-full" />
      <div>
        <h4 className="font-bold text-[#111813]">{userName}</h4>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(star => (
              <span className={star <= rating ? "text-[#13ec49]" : "text-gray-300"}>⭐</span>
            ))}
          </div>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
    
    {/* Verified Badge */}
    {isVerifiedPurchase && (
      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
        ✓ Đã mua hàng
      </span>
    )}
  </div>
  
  {/* Review Content */}
  <h5 className="font-bold text-lg mb-2">{title}</h5>
  <p className="text-gray-700 leading-relaxed mb-4">{content}</p>
  
  {/* Review Images */}
  {images.length > 0 && (
    <div className="flex gap-2 mb-4">
      {images.map(img => (
        <img src={img} className="w-20 h-20 rounded-lg object-cover cursor-pointer
                                  hover:opacity-80 transition-opacity" />
      ))}
    </div>
  )}
  
  {/* Actions */}
  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#13ec49]">
      <span>👍</span>
      <span>Hữu ích ({helpfulCount})</span>
    </button>
    <button className="text-sm text-gray-600 hover:text-[#13ec49]">
      Trả lời
    </button>
  </div>
</div>
```

#### D. Comment Section Component
```tsx
<div className="bg-white rounded-2xl border border-gray-200 p-6">
  <h3 className="text-2xl font-bold mb-6">Bình luận ({commentCount})</h3>
  
  {/* Comment Input */}
  <div className="mb-8">
    {user ? (
      <div className="flex gap-3">
        <img src={user.avatar} className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-xl resize-none
                       focus:border-[#13ec49] focus:ring-2 focus:ring-[#13ec49]/20"
            placeholder="Viết bình luận của bạn..."
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 
                               hover:bg-gray-200">
              Hủy
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#13ec49] text-[#102215] 
                               font-bold hover:brightness-110">
              Gửi
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-gray-600 mb-3">Đăng nhập để bình luận</p>
        <button className="px-6 py-2 rounded-lg bg-[#13ec49] text-[#102215] 
                           font-bold hover:brightness-110">
          Đăng nhập
        </button>
      </div>
    )}
  </div>
  
  {/* Comments List */}
  <div className="space-y-6">
    {comments.map(comment => (
      <CommentCard comment={comment} />
    ))}
  </div>
</div>
```

#### E. Comment Card with Reactions
```tsx
<div className="flex gap-3">
  <img src={avatar} className="w-10 h-10 rounded-full flex-shrink-0" />
  
  <div className="flex-1">
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-bold text-[#111813]">{userName}</h4>
        <span className="text-sm text-gray-500">•</span>
        <span className="text-sm text-gray-500">{timeAgo}</span>
      </div>
      <p className="text-gray-700">{content}</p>
    </div>
    
    {/* Reactions Bar */}
    <div className="flex items-center gap-4 mt-2 px-2">
      {/* Reaction Buttons */}
      <div className="flex items-center gap-1">
        <button 
          className={`p-1 rounded-full hover:bg-gray-100 transition-colors
                     ${userReaction === 'like' ? 'bg-blue-100' : ''}`}
          onClick={() => handleReaction('like')}
        >
          <span className="text-lg">👍</span>
        </button>
        <button 
          className={`p-1 rounded-full hover:bg-gray-100 transition-colors
                     ${userReaction === 'love' ? 'bg-red-100' : ''}`}
          onClick={() => handleReaction('love')}
        >
          <span className="text-lg">❤️</span>
        </button>
        <button 
          className={`p-1 rounded-full hover:bg-gray-100 transition-colors
                     ${userReaction === 'haha' ? 'bg-yellow-100' : ''}`}
          onClick={() => handleReaction('haha')}
        >
          <span className="text-lg">😂</span>
        </button>
        <button 
          className={`p-1 rounded-full hover:bg-gray-100 transition-colors
                     ${userReaction === 'wow' ? 'bg-orange-100' : ''}`}
          onClick={() => handleReaction('wow')}
        >
          <span className="text-lg">😮</span>
        </button>
      </div>
      
      {/* Reaction Count */}
      {reactionCount > 0 && (
        <span className="text-sm text-gray-600">
          {reactionCount} phản ứng
        </span>
      )}
      
      {/* Reply Button */}
      <button 
        className="text-sm text-gray-600 hover:text-[#13ec49] font-medium"
        onClick={() => setShowReplyForm(!showReplyForm)}
      >
        Trả lời
      </button>
    </div>
    
    {/* Reply Form */}
    {showReplyForm && (
      <div className="mt-3 ml-4">
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg
                       focus:border-[#13ec49] focus:ring-2 focus:ring-[#13ec49]/20"
            placeholder="Viết câu trả lời..."
          />
          <button className="px-4 py-2 rounded-lg bg-[#13ec49] text-[#102215] 
                             font-bold hover:brightness-110">
            Gửi
          </button>
        </div>
      </div>
    )}
    
    {/* Nested Replies */}
    {replies.length > 0 && (
      <div className="mt-4 ml-4 space-y-4 border-l-2 border-gray-200 pl-4">
        {replies.map(reply => (
          <CommentCard comment={reply} isReply={true} />
        ))}
      </div>
    )}
  </div>
</div>
```

---

## 🎯 2. MODAL VIẾT ĐÁNH GIÁ

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-2xl font-bold">Viết đánh giá</h2>
    </div>
    
    <div className="p-6 space-y-6">
      {/* Rating Stars */}
      <div>
        <label className="block text-sm font-bold mb-2">Đánh giá của bạn</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(star => (
            <button
              className={`text-4xl transition-all hover:scale-110
                         ${rating >= star ? 'text-[#13ec49]' : 'text-gray-300'}`}
              onClick={() => setRating(star)}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>
      
      {/* Review Title */}
      <div>
        <label className="block text-sm font-bold mb-2">Tiêu đề</label>
        <input 
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl
                     focus:border-[#13ec49] focus:ring-2 focus:ring-[#13ec49]/20"
          placeholder="Tóm tắt đánh giá của bạn"
        />
      </div>
      
      {/* Review Content */}
      <div>
        <label className="block text-sm font-bold mb-2">Nội dung</label>
        <textarea 
          className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none
                     focus:border-[#13ec49] focus:ring-2 focus:ring-[#13ec49]/20"
          rows={6}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
        />
      </div>
      
      {/* Upload Images */}
      <div>
        <label className="block text-sm font-bold mb-2">Hình ảnh (tùy chọn)</label>
        <div className="grid grid-cols-4 gap-3">
          {uploadedImages.map(img => (
            <div className="aspect-square rounded-lg overflow-hidden relative group">
              <img src={img} className="w-full h-full object-cover" />
              <button className="absolute top-1 right-1 bg-red-500 text-white 
                                 rounded-full p-1 opacity-0 group-hover:opacity-100">
                ✕
              </button>
            </div>
          ))}
          <label className="aspect-square border-2 border-dashed border-gray-300 
                           rounded-lg flex items-center justify-center cursor-pointer
                           hover:border-[#13ec49] transition-colors">
            <span className="text-4xl text-gray-400">+</span>
            <input type="file" className="hidden" accept="image/*" multiple />
          </label>
        </div>
      </div>
    </div>
    
    <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
      <button className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold
                         hover:bg-gray-200">
        Hủy
      </button>
      <button className="px-6 py-3 rounded-xl bg-[#13ec49] text-[#102215] font-bold
                         hover:brightness-110">
        Gửi đánh giá
      </button>
    </div>
  </div>
</div>
```

---

## 🎯 3. TRANG CHI TIẾT BLOG

```tsx
<div className="max-w-4xl mx-auto px-4 py-8">
  {/* Blog Header */}
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-4">
      <span className="bg-[#13ec49]/20 text-[#13ec49] text-xs font-bold px-3 py-1 
                       rounded-full">
        Hướng dẫn
      </span>
      <span className="text-gray-500 text-sm">•</span>
      <span className="text-gray-500 text-sm">10 phút đọc</span>
    </div>
    
    <h1 className="text-4xl md:text-5xl font-black text-[#111813] mb-4">
      Cách trồng mận hiệu quả cho năng suất cao
    </h1>
    
    <div className="flex items-center gap-4 mb-6">
      <img src={authorAvatar} className="w-12 h-12 rounded-full" />
      <div>
        <p className="font-bold text-[#111813]">{authorName}</p>
        <p className="text-sm text-gray-600">{publishedDate}</p>
      </div>
    </div>
    
    <img 
      src={featuredImage} 
      className="w-full aspect-video object-cover rounded-2xl"
    />
  </div>
  
  {/* Blog Content */}
  <div className="prose prose-lg max-w-none mb-12">
    {/* Markdown/HTML content */}
  </div>
  
  {/* Tags */}
  <div className="flex flex-wrap gap-2 mb-12">
    {tags.map(tag => (
      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm
                       hover:bg-[#13ec49]/20 hover:text-[#13ec49] cursor-pointer">
        #{tag}
      </span>
    ))}
  </div>
  
  {/* Share Buttons */}
  <div className="flex items-center gap-4 mb-12 pb-8 border-b border-gray-200">
    <span className="font-bold text-gray-700">Chia sẻ:</span>
    <button className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600">
      Facebook
    </button>
    <button className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600">
      Twitter
    </button>
    <button className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600">
      WhatsApp
    </button>
  </div>
  
  {/* Comments Section (Same as Product) */}
  <CommentSection commentableType="blog_post" commentableId={blogId} />
</div>
```

---

## 🎯 4. FORM ĐĂNG NHẬP/ĐĂNG KÝ

```tsx
<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
    {/* Logo */}
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 rounded-full bg-[#13ec49]/20 flex items-center 
                      justify-center text-[#13ec49]">
        <span className="material-symbols-outlined text-4xl">agriculture</span>
      </div>
    </div>
    
    <h2 className="text-3xl font-black text-center text-[#111813] mb-2">
      Đăng nhập
    </h2>
    <p className="text-center text-gray-600 mb-8">
      Chào mừng bạn quay trở lại!
    </p>
    
    {/* Social Login */}
    <div className="space-y-3 mb-6">
      <button className="w-full py-3 rounded-xl border-2 border-gray-200 
                         font-bold hover:bg-gray-50 flex items-center justify-center gap-3">
        <img src="/google-icon.svg" className="w-5 h-5" />
        Đăng nhập với Google
      </button>
      <button className="w-full py-3 rounded-xl border-2 border-gray-200 
                         font-bold hover:bg-gray-50 flex items-center justify-center gap-3">
        <img src="/facebook-icon.svg" className="w-5 h-5" />
        Đăng nhập với Facebook
      </button>
    </div>
    
    {/* Divider */}
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-px bg-gray-200"></div>
      <span className="text-gray-500 text-sm">hoặc</span>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>
    
    {/* Email/Password Form */}
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-2">Email</label>
        <input 
          type="email"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl
                     focus:border-[#13ec49] focus:ring-2 focus:ring-[#13ec49]/20"
          placeholder="your@email.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold mb-2">Mật khẩu</label>
        <input 
          type="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl
                     focus:border-[#13ec49] focus:ring-2 focus:ring-[#13ec49]/20"
          placeholder="••••••••"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded" />
          <span className="text-sm">Ghi nhớ đăng nhập</span>
        </label>
        <a href="#" className="text-sm text-[#13ec49] hover:underline">
          Quên mật khẩu?
        </a>
      </div>
      
      <button className="w-full py-3 rounded-xl bg-[#13ec49] text-[#102215] 
                         font-bold hover:brightness-110">
        Đăng nhập
      </button>
    </form>
    
    <p className="text-center text-sm text-gray-600 mt-6">
      Chưa có tài khoản?{' '}
      <a href="#" className="text-[#13ec49] font-bold hover:underline">
        Đăng ký ngay
      </a>
    </p>
  </div>
</div>
```

---

## 🎨 Color Palette

```css
/* Primary Colors */
--primary-green: #13ec49;
--primary-green-light: rgba(19, 236, 73, 0.1);
--primary-green-dark: #102215;

/* Neutral Colors */
--text-primary: #111813;
--text-secondary: #3c4740;
--text-muted: #61896b;
--border-color: #dbe6de;
--bg-light: #f6f8f6;
--bg-white: #ffffff;

/* Semantic Colors */
--success: #13ec49;
--error: #ef4444;
--warning: #f59e0b;
--info: #3b82f6;
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

---

## ✨ Animation & Transitions

```css
/* Hover Effects */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale In */
@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## 🚀 Next Steps

1. **Tạo component ProductDetail.tsx**
   - Image gallery
   - Product info
   - Rating overview
   - Reviews list
   - Comments section

2. **Tạo component BlogDetail.tsx**
   - Blog header
   - Content
   - Comments section

3. **Tạo shared components**
   - CommentCard.tsx
   - ReviewCard.tsx
   - RatingStars.tsx
   - ReactionButtons.tsx
   - AuthModal.tsx

4. **Implement API integration**
   - Fetch products/blogs
   - Submit reviews/comments
   - Handle reactions
   - User authentication

5. **Add state management**
   - User context
   - Comments state
   - Reviews state

Bạn muốn tôi bắt đầu implement component nào trước? 🎯
