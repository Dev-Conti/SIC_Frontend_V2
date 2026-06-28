import { Button } from "@material-tailwind/react";
import { LuRefreshCw } from "react-icons/lu";

export function RefreshDataButton({ onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    updateBacklog();
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="outlined" className="flex items-center gap-3" onClick={handleClick}>
        Refresh
        <LuRefreshCw className="h-full w-4" />
      </Button>
    </div>
  );
}