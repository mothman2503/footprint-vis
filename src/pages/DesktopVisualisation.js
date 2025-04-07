
function DesktopVisualisation() {
    return (
        <>
            <div className="flex flex-col space-y-2 h-dvh">
               <div className="w-full h-4/6 bg-indigo-300">
               <p className="font-mono font-semibold my-4">Show visualisation for one week (Allow swipe left and right to go to next and previous weeks)</p>

               </div>

               <div className="w-full h-1/6 bg-indigo-500">
               <p className="font-mono font-semibold my-4">Show visualisation overview/scroll throught time(one year) to control time period of main vis.... show frequency of internet usage </p>

               </div>

            </div>

        </>
    );
}

export default DesktopVisualisation;