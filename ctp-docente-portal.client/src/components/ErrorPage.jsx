import Button from "./ui/Button";
import { NavLink } from "react-router-dom";

const ErrorPage = ({ code, title, message, actions }) => {
  return (
    <div className="min-h-screen text-foreground dark:text-foreground-dark flex bg-background dark:bg-background-dark bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="flex flex-col items-center justify-center w-full px-4">
        <div className="text-center space-y-6 max-w-md">
          {/* Error code */}
          <div className="text-8xl md:text-9xl font-bold text-primary/20 dark:text-primary-foreground/20 select-none">
            {code}
          </div>

          {/* Main Message */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 md:justify-center">
            {actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                className="w-full sm:w-auto hover:scale-105 transition-transform"
              >
                <NavLink to={action.to}>{action.label}</NavLink>
              </Button>
            ))}
          </div>

          {/* Decorative Element */}
          <div className="pt-8">
            <div className="w-16 h-1 bg-gradient-to-r from-primary/50 to-transparent mx-auto rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
