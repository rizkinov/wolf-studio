"use client";

import React from 'react';
import Link from 'next/link';

import { CBREButton } from '@/components/cbre-button';
import { CBRECheckbox, CBRECheckboxWithLabel } from '@/components/cbre-checkbox';

export default function CheckboxExamplePage() {
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [newsletterOptions, setNewsletterOptions] = React.useState({
    updates: false,
    marketing: false,
    partner: false
  });
  
  const [sidebarItems, setSidebarItems] = React.useState({
    recents: true,
    home: true,
    applications: false,
    desktop: false,
    downloads: true,
    documents: false
  });

  const handleNewsletterChange = (option: keyof typeof newsletterOptions) => {
    setNewsletterOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSidebarItemChange = (option: keyof typeof sidebarItems) => {
    setSidebarItems(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="py-10 px-4 md:px-10 max-w-5xl mx-auto">
        <h1 className="text-6xl font-financier text-cbre-green mb-6">Checkbox Component</h1>
        <p className="text-dark-grey font-calibre mb-10 max-w-3xl">
          The CBRE Checkbox component provides a control that allows users to select multiple options from a set or to mark an option as checked.
        </p>
        
        {/* Basic Checkbox Example */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Basic Checkbox</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto">
              <CBRECheckbox id="basic-checkbox" />
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { CBRECheckbox } from '@/components/cbre-checkbox';

<CBRECheckbox id="basic-checkbox" />
`}
            </pre>
          </div>
        </div>
        
        {/* Checkbox with Label */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Checkbox with Label</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto">
              <CBRECheckboxWithLabel 
                id="terms-checkbox" 
                label="Accept terms and conditions"
                checked={acceptTerms}
                onCheckedChange={() => setAcceptTerms(!acceptTerms)}
              />
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { CBRECheckboxWithLabel } from '@/components/cbre-checkbox';

const [acceptTerms, setAcceptTerms] = React.useState(false);

<CBRECheckboxWithLabel 
  id="terms-checkbox" 
  label="Accept terms and conditions"
  checked={acceptTerms}
  onCheckedChange={(checked: boolean) => setAcceptTerms(checked)}
/>
`}
            </pre>
          </div>
        </div>
        
        {/* Checkbox with Description */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Checkbox with Description</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto">
              <CBRECheckboxWithLabel 
                id="terms-with-desc" 
                label="Accept terms and conditions"
                description="You agree to our Terms of Service and Privacy Policy."
                checked={acceptTerms}
                onCheckedChange={() => setAcceptTerms(!acceptTerms)}
              />
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBRECheckboxWithLabel 
  id="terms-with-desc" 
  label="Accept terms and conditions"
  description="You agree to our Terms of Service and Privacy Policy."
  checked={acceptTerms}
  onCheckedChange={(checked: boolean) => setAcceptTerms(checked)}
/>
`}
            </pre>
          </div>
        </div>
        
        {/* Disabled Checkbox */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Disabled Checkbox</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto">
              <CBRECheckboxWithLabel 
                id="disabled-checkbox" 
                label="Accept terms and conditions"
                disabled
              />
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBRECheckboxWithLabel 
  id="disabled-checkbox" 
  label="Accept terms and conditions"
  disabled
/>
`}
            </pre>
          </div>
        </div>
        
        {/* Checkbox Group: Newsletter */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Checkbox Group: Newsletter</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-financier text-cbre-green mb-2">Newsletter preferences</h3>
                  <p className="text-dark-grey font-calibre text-sm mb-4">Select the types of newsletters you'd like to receive</p>
                </div>
                
                <CBRECheckboxWithLabel 
                  id="updates-checkbox" 
                  label="Product updates"
                  description="Receive notifications about new features and improvements"
                  checked={newsletterOptions.updates}
                  onCheckedChange={() => handleNewsletterChange('updates')}
                />
                
                <CBRECheckboxWithLabel 
                  id="marketing-checkbox" 
                  label="Marketing communications"
                  description="Receive special offers, promotions, and marketing emails"
                  checked={newsletterOptions.marketing}
                  onCheckedChange={() => handleNewsletterChange('marketing')}
                />
                
                <CBRECheckboxWithLabel 
                  id="partner-checkbox" 
                  label="Partner offers"
                  description="Receive offers from our trusted partners"
                  checked={newsletterOptions.partner}
                  onCheckedChange={() => handleNewsletterChange('partner')}
                />
                
                <div className="pt-4">
                  <CBREButton variant="primary" size="sm">Save Preferences</CBREButton>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`const [newsletterOptions, setNewsletterOptions] = React.useState({
  updates: false,
  marketing: false,
  partner: false
});

const handleNewsletterChange = (option: keyof typeof newsletterOptions) => {
  setNewsletterOptions(prev => ({
    ...prev,
    [option]: !prev[option]
  }));
};

<div className="space-y-4">
  <div className="mb-4">
    <h3 className="text-xl font-financier text-cbre-green mb-2">Newsletter preferences</h3>
    <p className="text-dark-grey font-calibre text-sm mb-4">Select the types of newsletters you'd like to receive</p>
  </div>
  
  <CBRECheckboxWithLabel 
    id="updates-checkbox" 
    label="Product updates"
    description="Receive notifications about new features and improvements"
    checked={newsletterOptions.updates}
    onCheckedChange={() => handleNewsletterChange('updates')}
  />
  
  <CBRECheckboxWithLabel 
    id="marketing-checkbox" 
    label="Marketing communications"
    description="Receive special offers, promotions, and marketing emails"
    checked={newsletterOptions.marketing}
    onCheckedChange={() => handleNewsletterChange('marketing')}
  />
  
  <CBRECheckboxWithLabel 
    id="partner-checkbox" 
    label="Partner offers"
    description="Receive offers from our trusted partners"
    checked={newsletterOptions.partner}
    onCheckedChange={() => handleNewsletterChange('partner')}
  />
  
  <div className="pt-4">
    <CBREButton variant="primary" size="sm">Save Preferences</CBREButton>
  </div>
</div>
`}
            </pre>
          </div>
        </div>
        
        {/* Checkbox Group: Sidebar Items */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Checkbox Group: Sidebar Items</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-financier text-cbre-green mb-2">Sidebar</h3>
                  <p className="text-dark-grey font-calibre text-sm mb-4">Select the items you want to display in the sidebar</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <CBRECheckboxWithLabel 
                    id="recents-checkbox" 
                    label="Recents"
                    checked={sidebarItems.recents}
                    onCheckedChange={() => handleSidebarItemChange('recents')}
                  />
                  
                  <CBRECheckboxWithLabel 
                    id="home-checkbox" 
                    label="Home"
                    checked={sidebarItems.home}
                    onCheckedChange={() => handleSidebarItemChange('home')}
                  />
                  
                  <CBRECheckboxWithLabel 
                    id="applications-checkbox" 
                    label="Applications"
                    checked={sidebarItems.applications}
                    onCheckedChange={() => handleSidebarItemChange('applications')}
                  />
                  
                  <CBRECheckboxWithLabel 
                    id="desktop-checkbox" 
                    label="Desktop"
                    checked={sidebarItems.desktop}
                    onCheckedChange={() => handleSidebarItemChange('desktop')}
                  />
                  
                  <CBRECheckboxWithLabel 
                    id="downloads-checkbox" 
                    label="Downloads"
                    checked={sidebarItems.downloads}
                    onCheckedChange={() => handleSidebarItemChange('downloads')}
                  />
                  
                  <CBRECheckboxWithLabel 
                    id="documents-checkbox" 
                    label="Documents"
                    checked={sidebarItems.documents}
                    onCheckedChange={() => handleSidebarItemChange('documents')}
                  />
                </div>
                
                <div className="pt-4">
                  <CBREButton variant="primary" size="sm">Apply Changes</CBREButton>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`const [sidebarItems, setSidebarItems] = React.useState({
  recents: true,
  home: true,
  applications: false,
  desktop: false,
  downloads: true,
  documents: false
});

const handleSidebarItemChange = (option: keyof typeof sidebarItems) => {
  setSidebarItems(prev => ({
    ...prev,
    [option]: !prev[option]
  }));
};

<div className="grid md:grid-cols-2 gap-4">
  <CBRECheckboxWithLabel 
    id="recents-checkbox" 
    label="Recents"
    checked={sidebarItems.recents}
    onCheckedChange={() => handleSidebarItemChange('recents')}
  />
  
  <CBRECheckboxWithLabel 
    id="home-checkbox" 
    label="Home"
    checked={sidebarItems.home}
    onCheckedChange={() => handleSidebarItemChange('home')}
  />
  
  <CBRECheckboxWithLabel 
    id="applications-checkbox" 
    label="Applications"
    checked={sidebarItems.applications}
    onCheckedChange={() => handleSidebarItemChange('applications')}
  />
  
  <CBRECheckboxWithLabel 
    id="desktop-checkbox" 
    label="Desktop"
    checked={sidebarItems.desktop}
    onCheckedChange={() => handleSidebarItemChange('desktop')}
  />
  
  <CBRECheckboxWithLabel 
    id="downloads-checkbox" 
    label="Downloads"
    checked={sidebarItems.downloads}
    onCheckedChange={() => handleSidebarItemChange('downloads')}
  />
  
  <CBRECheckboxWithLabel 
    id="documents-checkbox" 
    label="Documents"
    checked={sidebarItems.documents}
    onCheckedChange={() => handleSidebarItemChange('documents')}
  />
</div>
`}
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