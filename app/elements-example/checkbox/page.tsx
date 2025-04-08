"use client";

import React from 'react';
import Link from 'next/link';

import { CBREButton } from '@/components/cbre-button';
import { Checkbox, CheckboxItem, CheckboxGroup } from '@/components/cbre-checkbox';

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
              <Checkbox id="basic-checkbox" />
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { Checkbox } from '@/components/cbre-checkbox';

<Checkbox id="basic-checkbox" />
`}
            </pre>
          </div>
        </div>
        
        {/* Checkbox with Label */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Checkbox with Label</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto">
              <CheckboxItem 
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
{`import { CheckboxItem } from '@/components/cbre-checkbox';

const [acceptTerms, setAcceptTerms] = React.useState(false);

<CheckboxItem 
  id="terms-checkbox" 
  label="Accept terms and conditions"
  checked={acceptTerms}
  onCheckedChange={() => setAcceptTerms(!acceptTerms)}
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
              <CheckboxItem 
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
{`<CheckboxItem 
  id="terms-with-desc" 
  label="Accept terms and conditions"
  description="You agree to our Terms of Service and Privacy Policy."
  checked={acceptTerms}
  onCheckedChange={() => setAcceptTerms(!acceptTerms)}
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
              <CheckboxItem 
                id="disabled-checkbox" 
                label="Accept terms and conditions"
                disabled
              />
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CheckboxItem 
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
              <CheckboxGroup
                title="Newsletter preferences"
                description="Select the types of newsletters you'd like to receive"
              >
                <CheckboxItem 
                  id="updates-checkbox" 
                  label="Product updates"
                  description="Receive notifications about new features and improvements"
                  checked={newsletterOptions.updates}
                  onCheckedChange={() => handleNewsletterChange('updates')}
                />
                
                <CheckboxItem 
                  id="marketing-checkbox" 
                  label="Marketing communications"
                  description="Receive special offers, promotions, and marketing emails"
                  checked={newsletterOptions.marketing}
                  onCheckedChange={() => handleNewsletterChange('marketing')}
                />
                
                <CheckboxItem 
                  id="partner-checkbox" 
                  label="Partner offers"
                  description="Receive offers from our trusted partners"
                  checked={newsletterOptions.partner}
                  onCheckedChange={() => handleNewsletterChange('partner')}
                />
              </CheckboxGroup>
              
              <div className="pt-4 mt-4">
                <CBREButton variant="primary" size="sm">Save Preferences</CBREButton>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { CheckboxGroup, CheckboxItem } from '@/components/cbre-checkbox';

const [newsletterOptions, setNewsletterOptions] = React.useState({
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

<CheckboxGroup
  title="Newsletter preferences"
  description="Select the types of newsletters you'd like to receive"
>
  <CheckboxItem 
    id="updates-checkbox" 
    label="Product updates"
    description="Receive notifications about new features and improvements"
    checked={newsletterOptions.updates}
    onCheckedChange={() => handleNewsletterChange('updates')}
  />
  
  <CheckboxItem 
    id="marketing-checkbox" 
    label="Marketing communications"
    description="Receive special offers, promotions, and marketing emails"
    checked={newsletterOptions.marketing}
    onCheckedChange={() => handleNewsletterChange('marketing')}
  />
  
  <CheckboxItem 
    id="partner-checkbox" 
    label="Partner offers"
    description="Receive offers from our trusted partners"
    checked={newsletterOptions.partner}
    onCheckedChange={() => handleNewsletterChange('partner')}
  />
</CheckboxGroup>
`}
            </pre>
          </div>
        </div>
        
        {/* Checkbox Group: Sidebar Items */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Checkbox Group: Sidebar Items</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto">
              <CheckboxGroup
                title="Sidebar"
                description="Select the items you want to display in the sidebar"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <CheckboxItem 
                    id="recents-checkbox" 
                    label="Recents"
                    checked={sidebarItems.recents}
                    onCheckedChange={() => handleSidebarItemChange('recents')}
                  />
                  
                  <CheckboxItem 
                    id="home-checkbox" 
                    label="Home"
                    checked={sidebarItems.home}
                    onCheckedChange={() => handleSidebarItemChange('home')}
                  />
                  
                  <CheckboxItem 
                    id="applications-checkbox" 
                    label="Applications"
                    checked={sidebarItems.applications}
                    onCheckedChange={() => handleSidebarItemChange('applications')}
                  />
                  
                  <CheckboxItem 
                    id="desktop-checkbox" 
                    label="Desktop"
                    checked={sidebarItems.desktop}
                    onCheckedChange={() => handleSidebarItemChange('desktop')}
                  />
                  
                  <CheckboxItem 
                    id="downloads-checkbox" 
                    label="Downloads"
                    checked={sidebarItems.downloads}
                    onCheckedChange={() => handleSidebarItemChange('downloads')}
                  />
                  
                  <CheckboxItem 
                    id="documents-checkbox" 
                    label="Documents"
                    checked={sidebarItems.documents}
                    onCheckedChange={() => handleSidebarItemChange('documents')}
                  />
                </div>
              </CheckboxGroup>
              
              <div className="pt-4 mt-4">
                <CBREButton variant="primary" size="sm">Apply Changes</CBREButton>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CheckboxGroup
  title="Sidebar"
  description="Select the items you want to display in the sidebar"
>
  <div className="grid md:grid-cols-2 gap-4">
    <CheckboxItem 
      id="recents-checkbox" 
      label="Recents"
      checked={sidebarItems.recents}
      onCheckedChange={() => handleSidebarItemChange('recents')}
    />
    
    <CheckboxItem 
      id="home-checkbox" 
      label="Home"
      checked={sidebarItems.home}
      onCheckedChange={() => handleSidebarItemChange('home')}
    />
    
    <CheckboxItem 
      id="applications-checkbox" 
      label="Applications"
      checked={sidebarItems.applications}
      onCheckedChange={() => handleSidebarItemChange('applications')}
    />
    
    <CheckboxItem 
      id="desktop-checkbox" 
      label="Desktop"
      checked={sidebarItems.desktop}
      onCheckedChange={() => handleSidebarItemChange('desktop')}
    />
    
    <CheckboxItem 
      id="downloads-checkbox" 
      label="Downloads"
      checked={sidebarItems.downloads}
      onCheckedChange={() => handleSidebarItemChange('downloads')}
    />
    
    <CheckboxItem 
      id="documents-checkbox" 
      label="Documents"
      checked={sidebarItems.documents}
      onCheckedChange={() => handleSidebarItemChange('documents')}
    />
  </div>
</CheckboxGroup>
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