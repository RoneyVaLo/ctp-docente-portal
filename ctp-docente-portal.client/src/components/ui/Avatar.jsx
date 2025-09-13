import { forwardRef } from "react";

const Avatar = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = forwardRef(
  ({ className = "", src, alt, ...props }, ref) => (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
      onError={(e) => {
        e.target.style.display = "none";
      }}
      {...props}
    />
  )
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full items-center justify-center rounded-full font-medium ${className}`}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

Avatar.Image = AvatarImage;
Avatar.Fallback = AvatarFallback;

export default Avatar;
