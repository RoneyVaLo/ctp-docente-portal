import { Card } from "../ui/Card";

const LoaderFunFact = ({ funFact }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Fun fact card */}
        <Card className="p-6 bg-white/70 dark:bg-[#020202]/50 backdrop-blur-sm border border-gray-200 dark:border-border/50 transition-all duration-500 hover:bg-gray-50 dark:hover:bg-[#020202]/70">
          <div className="text-center space-y-4">
            <div className="text-4xl mb-2 animate-bounce">{funFact?.icon}</div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-surface">
              Sabías que...
            </h3>
            <p className="text-sm text-gray-900 dark:text-[#9e9e9e] leading-relaxed">
              {funFact?.fact}
            </p>
          </div>
        </Card>

        {/* Loading dots indicator */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gray-600 dark:bg-surface animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoaderFunFact;
