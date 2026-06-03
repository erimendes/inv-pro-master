import RackEditorView from '../components/RackEditorView';

interface Props {
  rackId: string;
  onBack: () => void;
}

export default function RackEditPage({ rackId, onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#020617]">
      <RackEditorView rackId={rackId} onBack={onBack} />
    </div>
  );
}