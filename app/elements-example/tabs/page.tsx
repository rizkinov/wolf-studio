"use client";

import React from 'react';
import { 
  CBRETabs, 
  CBRETabsList, 
  CBRETabsTrigger, 
  CBRETabsContent 
} from '@/components/cbre-tabs';
import { CBREButton } from '@/components/cbre-button';
import Link from 'next/link';

export default function TabsExamplePage() {
  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-financier text-cbre-green mb-6">Tabs Component</h1>
        
        {/* Basic Tabs Example */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Basic Tabs</h2>
          <div className="bg-[var(--lighter-grey)] p-8">
            <CBRETabs defaultValue="account">
              <CBRETabsList>
                <CBRETabsTrigger value="account">Account</CBRETabsTrigger>
                <CBRETabsTrigger value="password">Password</CBRETabsTrigger>
                <CBRETabsTrigger value="settings">Settings</CBRETabsTrigger>
              </CBRETabsList>
              <CBRETabsContent value="account">
                <div className="bg-white p-6 border border-light-grey">
                  <h3 className="text-xl font-financier text-cbre-green mb-3">Account Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block font-calibre font-medium text-dark-grey mb-2">Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        className="w-full border border-light-grey p-2 focus:outline-none focus:ring-2 focus:ring-accent-green"
                      />
                    </div>
                    <div>
                      <label className="block font-calibre font-medium text-dark-grey mb-2">Email</label>
                      <input 
                        type="email" 
                        placeholder="john.doe@example.com" 
                        className="w-full border border-light-grey p-2 focus:outline-none focus:ring-2 focus:ring-accent-green"
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <CBREButton variant="outline">Cancel</CBREButton>
                      <CBREButton variant="primary">Save Changes</CBREButton>
                    </div>
                  </div>
                </div>
              </CBRETabsContent>
              <CBRETabsContent value="password">
                <div className="bg-white p-6 border border-light-grey">
                  <h3 className="text-xl font-financier text-cbre-green mb-3">Password Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block font-calibre font-medium text-dark-grey mb-2">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full border border-light-grey p-2 focus:outline-none focus:ring-2 focus:ring-accent-green"
                      />
                    </div>
                    <div>
                      <label className="block font-calibre font-medium text-dark-grey mb-2">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full border border-light-grey p-2 focus:outline-none focus:ring-2 focus:ring-accent-green"
                      />
                    </div>
                    <div>
                      <label className="block font-calibre font-medium text-dark-grey mb-2">Confirm Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full border border-light-grey p-2 focus:outline-none focus:ring-2 focus:ring-accent-green"
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <CBREButton variant="outline">Cancel</CBREButton>
                      <CBREButton variant="primary">Update Password</CBREButton>
                    </div>
                  </div>
                </div>
              </CBRETabsContent>
              <CBRETabsContent value="settings">
                <div className="bg-white p-6 border border-light-grey">
                  <h3 className="text-xl font-financier text-cbre-green mb-3">General Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block font-calibre font-medium text-dark-grey mb-2">Language</label>
                      <select className="w-full border border-light-grey p-2 focus:outline-none focus:ring-2 focus:ring-accent-green">
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-calibre font-medium text-dark-grey mb-2">Notifications</label>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="email-notifications" className="accent-cbre-green" />
                        <label htmlFor="email-notifications">Email Notifications</label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-4">
                      <CBREButton variant="outline">Cancel</CBREButton>
                      <CBREButton variant="primary">Save Settings</CBREButton>
                    </div>
                  </div>
                </div>
              </CBRETabsContent>
            </CBRETabs>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBRETabs defaultValue="account">
  <CBRETabsList>
    <CBRETabsTrigger value="account">Account</CBRETabsTrigger>
    <CBRETabsTrigger value="password">Password</CBRETabsTrigger>
    <CBRETabsTrigger value="settings">Settings</CBRETabsTrigger>
  </CBRETabsList>
  <CBRETabsContent value="account">
    Account settings content
  </CBRETabsContent>
  <CBRETabsContent value="password">
    Password settings content
  </CBRETabsContent>
  <CBRETabsContent value="settings">
    General settings content
  </CBRETabsContent>
</CBRETabs>`}
            </pre>
          </div>
        </div>
        
        {/* Tab Variants */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Tab Variants</h2>
          
          <div className="space-y-12">
            {/* Underline Variant */}
            <div>
              <h3 className="text-xl font-financier text-cbre-green mb-3">Underline Variant (Default)</h3>
              <div className="bg-[var(--lighter-grey)] p-8">
                <CBRETabs defaultValue="overview" variant="underline">
                  <CBRETabsList variant="underline">
                    <CBRETabsTrigger value="overview" variant="underline">Overview</CBRETabsTrigger>
                    <CBRETabsTrigger value="features" variant="underline">Features</CBRETabsTrigger>
                    <CBRETabsTrigger value="specifications" variant="underline">Specifications</CBRETabsTrigger>
                  </CBRETabsList>
                  <CBRETabsContent value="overview">
                    <div className="p-4 font-calibre">
                      <p>This is the overview content. The underline variant uses a bottom border to indicate the active tab.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="features">
                    <div className="p-4 font-calibre">
                      <p>Features content goes here.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="specifications">
                    <div className="p-4 font-calibre">
                      <p>Specifications content goes here.</p>
                    </div>
                  </CBRETabsContent>
                </CBRETabs>
              </div>
            </div>
            
            {/* Boxed Variant */}
            <div>
              <h3 className="text-xl font-financier text-cbre-green mb-3">Boxed Variant</h3>
              <div className="bg-[var(--lighter-grey)] p-8">
                <CBRETabs defaultValue="overview" variant="boxed">
                  <CBRETabsList variant="boxed">
                    <CBRETabsTrigger value="overview" variant="boxed">Overview</CBRETabsTrigger>
                    <CBRETabsTrigger value="features" variant="boxed">Features</CBRETabsTrigger>
                    <CBRETabsTrigger value="specifications" variant="boxed">Specifications</CBRETabsTrigger>
                  </CBRETabsList>
                  <CBRETabsContent value="overview">
                    <div className="p-4 font-calibre">
                      <p>This is the overview content. The boxed variant uses a background color and border to indicate the active tab.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="features">
                    <div className="p-4 font-calibre">
                      <p>Features content goes here.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="specifications">
                    <div className="p-4 font-calibre">
                      <p>Specifications content goes here.</p>
                    </div>
                  </CBRETabsContent>
                </CBRETabs>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Variant Usage</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Underline variant (default)
<CBRETabs defaultValue="tab1" variant="underline">
  <CBRETabsList variant="underline">
    <CBRETabsTrigger value="tab1" variant="underline">Tab 1</CBRETabsTrigger>
    <!-- Other tabs -->
  </CBRETabsList>
  <!-- Tab content -->
</CBRETabs>

// Boxed variant
<CBRETabs defaultValue="tab1" variant="boxed">
  <CBRETabsList variant="boxed">
    <CBRETabsTrigger value="tab1" variant="boxed">Tab 1</CBRETabsTrigger>
    <!-- Other tabs -->
  </CBRETabsList>
  <!-- Tab content -->
</CBRETabs>`}
            </pre>
          </div>
        </div>
        
        {/* Size Variants */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Size Variants</h2>
          
          <div className="space-y-12">
            {/* Small Size */}
            <div>
              <h3 className="text-xl font-financier text-cbre-green mb-3">Small Size</h3>
              <div className="bg-[var(--lighter-grey)] p-8">
                <CBRETabs defaultValue="tab1" size="sm">
                  <CBRETabsList size="sm">
                    <CBRETabsTrigger value="tab1" size="sm">Tab 1</CBRETabsTrigger>
                    <CBRETabsTrigger value="tab2" size="sm">Tab 2</CBRETabsTrigger>
                    <CBRETabsTrigger value="tab3" size="sm">Tab 3</CBRETabsTrigger>
                  </CBRETabsList>
                  <CBRETabsContent value="tab1">
                    <div className="p-4 font-calibre">
                      <p>Content for small size tabs.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="tab2">
                    <div className="p-4 font-calibre">
                      <p>Tab 2 content.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="tab3">
                    <div className="p-4 font-calibre">
                      <p>Tab 3 content.</p>
                    </div>
                  </CBRETabsContent>
                </CBRETabs>
              </div>
            </div>
            
            {/* Medium Size (Default) */}
            <div>
              <h3 className="text-xl font-financier text-cbre-green mb-3">Medium Size (Default)</h3>
              <div className="bg-[var(--lighter-grey)] p-8">
                <CBRETabs defaultValue="tab1" size="md">
                  <CBRETabsList size="md">
                    <CBRETabsTrigger value="tab1" size="md">Tab 1</CBRETabsTrigger>
                    <CBRETabsTrigger value="tab2" size="md">Tab 2</CBRETabsTrigger>
                    <CBRETabsTrigger value="tab3" size="md">Tab 3</CBRETabsTrigger>
                  </CBRETabsList>
                  <CBRETabsContent value="tab1">
                    <div className="p-4 font-calibre">
                      <p>Content for medium size tabs.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="tab2">
                    <div className="p-4 font-calibre">
                      <p>Tab 2 content.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="tab3">
                    <div className="p-4 font-calibre">
                      <p>Tab 3 content.</p>
                    </div>
                  </CBRETabsContent>
                </CBRETabs>
              </div>
            </div>
            
            {/* Large Size */}
            <div>
              <h3 className="text-xl font-financier text-cbre-green mb-3">Large Size</h3>
              <div className="bg-[var(--lighter-grey)] p-8">
                <CBRETabs defaultValue="tab1" size="lg">
                  <CBRETabsList size="lg">
                    <CBRETabsTrigger value="tab1" size="lg">Tab 1</CBRETabsTrigger>
                    <CBRETabsTrigger value="tab2" size="lg">Tab 2</CBRETabsTrigger>
                    <CBRETabsTrigger value="tab3" size="lg">Tab 3</CBRETabsTrigger>
                  </CBRETabsList>
                  <CBRETabsContent value="tab1">
                    <div className="p-4 font-calibre">
                      <p>Content for large size tabs.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="tab2">
                    <div className="p-4 font-calibre">
                      <p>Tab 2 content.</p>
                    </div>
                  </CBRETabsContent>
                  <CBRETabsContent value="tab3">
                    <div className="p-4 font-calibre">
                      <p>Tab 3 content.</p>
                    </div>
                  </CBRETabsContent>
                </CBRETabs>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Size Variations</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Small size
<CBRETabs defaultValue="tab1" size="sm">
  <CBRETabsList size="sm">
    <CBRETabsTrigger value="tab1" size="sm">Tab 1</CBRETabsTrigger>
    <!-- Other tabs -->
  </CBRETabsList>
  <!-- Tab content -->
</CBRETabs>

// Medium size (default)
<CBRETabs defaultValue="tab1" size="md">
  <CBRETabsList size="md">
    <CBRETabsTrigger value="tab1" size="md">Tab 1</CBRETabsTrigger>
    <!-- Other tabs -->
  </CBRETabsList>
  <!-- Tab content -->
</CBRETabs>

// Large size
<CBRETabs defaultValue="tab1" size="lg">
  <CBRETabsList size="lg">
    <CBRETabsTrigger value="tab1" size="lg">Tab 1</CBRETabsTrigger>
    <!-- Other tabs -->
  </CBRETabsList>
  <!-- Tab content -->
</CBRETabs>`}
            </pre>
          </div>
        </div>
        
        {/* Disabled Tabs */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Disabled Tabs</h2>
          <div className="bg-[var(--lighter-grey)] p-8">
            <CBRETabs defaultValue="tab1">
              <CBRETabsList>
                <CBRETabsTrigger value="tab1">Active Tab</CBRETabsTrigger>
                <CBRETabsTrigger value="tab2" disabled>Disabled Tab</CBRETabsTrigger>
                <CBRETabsTrigger value="tab3">Another Tab</CBRETabsTrigger>
              </CBRETabsList>
              <CBRETabsContent value="tab1">
                <div className="p-4 font-calibre">
                  <p>This example shows how to create a disabled tab that cannot be clicked.</p>
                </div>
              </CBRETabsContent>
              <CBRETabsContent value="tab2">
                <div className="p-4 font-calibre">
                  <p>This content won't be accessible due to the disabled tab.</p>
                </div>
              </CBRETabsContent>
              <CBRETabsContent value="tab3">
                <div className="p-4 font-calibre">
                  <p>Third tab content.</p>
                </div>
              </CBRETabsContent>
            </CBRETabs>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Disabled Tab Example</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBRETabs defaultValue="tab1">
  <CBRETabsList>
    <CBRETabsTrigger value="tab1">Active Tab</CBRETabsTrigger>
    <CBRETabsTrigger value="tab2" disabled>Disabled Tab</CBRETabsTrigger>
    <CBRETabsTrigger value="tab3">Another Tab</CBRETabsTrigger>
  </CBRETabsList>
  <!-- Tab content -->
</CBRETabs>`}
            </pre>
          </div>
        </div>
        
        <div className="mt-16 flex justify-center">
          <Link href="/elements-example">
            <CBREButton variant="outline">Back to UI Elements</CBREButton>
          </Link>
        </div>
      </div>
    </div>
  );
} 