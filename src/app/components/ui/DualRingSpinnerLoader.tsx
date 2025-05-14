export const DualRingSpinnerLoader = () => {
    return (
      <>
        <style>
          {`
            @keyframes spin {
              0% {
                rotate: 0deg;
                scale: 1;
              }
              30% {
                rotate: 20deg;
                scale: 0.9;
              }
              100% {
                rotate: -360deg;
                scale: 1;
              }
            }
          `}
        </style>
        <div className="relative flex items-center justify-center z-30">
          <div
            className="repeat-infinite size-12 rounded-full border-4 dark:border-gray-50 border-gray-500 border-t-transparent ease-in-out "
            style={{
              animationName: "spin",
              animationDuration: "1.5s",
            }}
          />
          <div
            className="repeat-infinite direction-reverse absolute size-9 rounded-full border-4 dark:border-gray-50 border-gray-500 border-b-transparent ease-in-out "
            style={{
              animationName: "spin",
              animationDuration: "2s",
            }}
          />
          <span className="sr-only">Loading...</span>
        </div>
      </>
    );
  };
  
  export default DualRingSpinnerLoader;
  