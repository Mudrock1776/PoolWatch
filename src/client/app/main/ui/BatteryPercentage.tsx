'use client';
import React from 'react';

export default function BatteryPercentage({ selectedDevice }: { selectedDevice: any }) {
  let batteryDisplay = '--';

  if (selectedDevice && selectedDevice.battery != null) {
    batteryDisplay = `${Number(selectedDevice.battery)}%`;

  }

 
  return (
    <div>
      <h2 className="text-xl font-semibold">Battery Percentage</h2>
      <p className="text-2xl font-bold mt-2">{batteryDisplay}</p>
    </div>
  );
}
