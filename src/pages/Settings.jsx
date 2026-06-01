// src/pages/Settings.jsx
import React, { useState } from 'react';
import { simulateApiCall } from '../services/dataService';
import { FiSave, FiBell, FiGlobe, FiLock, FiUser } from 'react-icons/fi';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    language: 'en',
    emailUpdates: true,
    twoFactor: false,
  });

  const handleSave = async () => {
    setLoading(true);
    await simulateApiCall();
    setLoading(false);
    alert('Settings saved successfully!');
  };

  const SettingSection = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Icon className="text-indigo-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between py-3 cursor-pointer">
      <span className="text-gray-700">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-10 h-5 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
          <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${checked ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
        </div>
      </div>
    </label>
  );

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <SettingSection icon={FiUser} title="Profile">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="Brij Kumar"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                defaultValue="brij.k@hrms.com"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection icon={FiBell} title="Notifications">
          <Toggle
            label="Push Notifications"
            checked={settings.notifications}
            onChange={() => setSettings({...settings, notifications: !settings.notifications})}
          />
          <Toggle
            label="Email Updates"
            checked={settings.emailUpdates}
            onChange={() => setSettings({...settings, emailUpdates: !settings.emailUpdates})}
          />
        </SettingSection>

        {/* Preferences */}
        <SettingSection icon={FiGlobe} title="Preferences">
          <div className="py-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
            >
              <option value="en">English (EN)</option>
              <option value="es">Spanish (ES)</option>
              <option value="fr">French (FR)</option>
            </select>
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection icon={FiLock} title="Security">
          <Toggle
            label="Two-Factor Authentication"
            checked={settings.twoFactor}
            onChange={() => setSettings({...settings, twoFactor: !settings.twoFactor})}
          />
          <button className="w-full mt-3 px-4 py-2 text-center text-sm text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition">
            Change Password
          </button>
        </SettingSection>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
        >
          <FiSave size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;