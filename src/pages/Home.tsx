import { useNavigate } from 'react-router-dom';
import { Shield, User, MapPin } from 'lucide-react';
import { AddressSearch } from '../components/AddressSearch';

function FeaturePill({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-surface px-4 py-2 text-sm text-text-muted">
      <Icon size={16} className="text-civic-blue" />
      {label}
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();

  function handleSelect(address: string) {
    navigate('/report?addr=' + encodeURIComponent(address));
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-display text-5xl font-bold text-civic-blue">
          Know Your Building
          <br />
          Before You Sign
        </h1>
        <p className="text-text-muted text-lg max-w-xl mx-auto">
          Instant building violations, landlord grades, and neighborhood scores
          for any NYC address.
        </p>
      </div>

      <div className="w-full max-w-lg">
        <AddressSearch onSelect={handleSelect} autoFocus />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <FeaturePill icon={Shield} label="Building Safety" />
        <FeaturePill icon={User} label="Landlord Grade" />
        <FeaturePill icon={MapPin} label="Neighborhood Score" />
      </div>
    </div>
  );
}
