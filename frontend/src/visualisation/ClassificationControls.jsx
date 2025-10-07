// components/Visualisation/ClassificationControls.jsx
import ClassificationDialog from "./ClassificationDialog";
import ClassificationPreview from "./ClassificationPreview";

const ClassificationControls = ({
  showDialog,
  setShowDialog,
  loading,
  onClassify,
  preview,
  onApply,
  onCancel,
  errorInfo
}) => (
  <><ClassificationDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  onClassify={onClassify}
  loading={loading}
  errorInfo={errorInfo}
/>

    {preview && (
      <ClassificationPreview
        results={preview}
        onApply={onApply}
        onCancel={onCancel}
      />
    )}
  </>
);

export default ClassificationControls;
