import FileUploader from "../components/FileUploader";

function Datasets() {
    return (
        <div className="max-w-screen-xl py-2 px-6 mx-auto">
        

        <div className="flex flex-col space-y-2">
        <h1 className="font-mono font-semibold my-4">Choose a Dataset:</h1>

        <h1 className="font-mono font-semibold my-4">--List artificial datasets here--</h1>

        <h1 className="font-mono font-semibold my-4">OR</h1>


        <h1 className="font-mono font-semibold my-4">Use your own History</h1>

        <h1 className="font-mono font-semibold my-4">--Insert Instructions to get History from Google Takeout--</h1>

        <h1 className="font-mono font-semibold my-4">Add the file here:</h1>

        <FileUploader />
        </div>

        </div>
    );

}
export default Datasets;
