'use client';

import { useEffect, useState } from 'react';
import { fetchAgentVoices } from '@/lib/supabase';

export default function AgentVoiceSelector() {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    async function loadVoices() {
      const data = await fetchAgentVoices();
      setVoices(data);
    }

    loadVoices();
  }, []);

  const isCurrentlyAvailable = (voice: any) => {
    if (!voice.unlock_start || !voice.unlock_end) return true;

    const now = new Date();
    const start = new Date(voice.unlock_start);
    const end = new Date(voice.unlock_end);

    return now >= start && now <= end;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {voices.map((voice) => {
        const available = isCurrentlyAvailable(voice);

        return (
          <div
            key={voice.persona_id}
            className={`p-4 border rounded-md shadow-md ${
              available ? 'bg-white' : 'bg-gray-100 opacity-50'
            }`}
          >
            <h2 className="text-xl font-bold text-[#111]">{voice.voice_name}</h2>
            <p className="text-sm text-gray-600">{voice.description}</p>
            {available ? (
              <span className="text-green-600 text-xs mt-1 inline-block">Available Now</span>
            ) : (
              <span className="text-red-500 text-xs mt-1 inline-block">Locked or Time-Limited</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
