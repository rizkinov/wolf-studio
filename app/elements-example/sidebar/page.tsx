"use client";

import React from 'react';
import Link from 'next/link';
import { HomeIcon, MailIcon, CalendarIcon, SearchIcon, Settings2Icon, FolderIcon, UsersIcon, BriefcaseIcon, BarChartIcon, ShieldIcon } from 'lucide-react';

import { CBREButton } from '@/components/cbre-button';
import {
  CBRESidebarProvider,
  CBRESidebar,
  CBRESidebarTrigger,
  CBRESidebarHeader,
  CBRESidebarContent,
  CBRESidebarFooter,
  CBRESidebarGroup,
  CBRESidebarGroupLabel,
  CBRESidebarGroupContent,
  CBRESidebarMenu,
  CBRESidebarMenuItem,
  CBRESidebarMenuButton,
  CBRESidebarMenuSub,
  CBRESidebarMenuSubItem,
  CBRESidebarMenuSubButton,
  CBRESidebarMenuBadge,
  CBRESidebarSeparator,
  useSidebar
} from '@/components/cbre-sidebar';

// Menu items for the example
const mainMenuItems = [
  { title: "Home", icon: HomeIcon, url: "#", active: true },
  { title: "Inbox", icon: MailIcon, url: "#", badge: "3" },
  { title: "Calendar", icon: CalendarIcon, url: "#" },
  { title: "Search", icon: SearchIcon, url: "#" },
  { title: "Settings", icon: Settings2Icon, url: "#" },
];

const projectMenuItems = [
  { title: "Client Projects", icon: BriefcaseIcon, url: "#" },
  { title: "Marketing", icon: BarChartIcon, url: "#" },
  { title: "Research", icon: SearchIcon, url: "#" },
];

const teamMenuItems = [
  { title: "Marketing Team", url: "#" },
  { title: "Sales Team", url: "#" },
  { title: "Development Team", url: "#" },
  { title: "Design Team", url: "#" },
];

// Logo component for the sidebar header
function CBRELogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  if (isCollapsed) {
    return (
      <div className="flex items-center p-2 justify-center">
        <div className="logo-square">C</div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center p-2">
      <div className="logo-square">C</div>
      <div className="ml-2 h-8 w-16">
        <span className="logo-cbre-green"></span>
      </div>
    </div>
  );
}

export default function SidebarExamplePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="py-10 px-4 md:px-10 max-w-5xl mx-auto">
        <h1 className="text-6xl font-financier text-cbre-green mb-6">Sidebar Component</h1>
        <p className="text-dark-grey font-calibre mb-10 max-w-3xl">
          The CBRE Sidebar component provides navigation for applications. It can be configured to
          collapse to icons, be fully hidden, or display different types of content sections.
        </p>
        
        {/* Basic Sidebar Example */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Basic Sidebar</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey relative">
              <div className="h-[500px] flex overflow-hidden">
                <CBRESidebarProvider defaultOpen={true}>
                  <div className="flex h-full w-full relative overflow-hidden">
                    <CBRESidebar className="!static !w-64 !h-full max-w-[16rem]">
                      <CBRESidebarHeader>
                        <CBRELogo />
                      </CBRESidebarHeader>
                      <CBRESidebarContent>
                        <CBRESidebarGroup>
                          <CBRESidebarGroupLabel>Main Navigation</CBRESidebarGroupLabel>
                          <CBRESidebarGroupContent>
                            <CBRESidebarMenu>
                              {mainMenuItems.map((item) => (
                                <CBRESidebarMenuItem key={item.title}>
                                  <CBRESidebarMenuButton asChild isActive={item.active}>
                                    <a href={item.url} className="flex w-full">
                                      <item.icon className="size-5 mr-2" />
                                      <span>{item.title}</span>
                                      {item.badge && (
                                        <CBRESidebarMenuBadge className="ml-auto">
                                          {item.badge}
                                        </CBRESidebarMenuBadge>
                                      )}
                                    </a>
                                  </CBRESidebarMenuButton>
                                </CBRESidebarMenuItem>
                              ))}
                            </CBRESidebarMenu>
                          </CBRESidebarGroupContent>
                        </CBRESidebarGroup>
                        
                        <CBRESidebarSeparator />
                        
                        <CBRESidebarGroup>
                          <CBRESidebarGroupLabel>Projects</CBRESidebarGroupLabel>
                          <CBRESidebarGroupContent>
                            <CBRESidebarMenu>
                              {projectMenuItems.map((item) => (
                                <CBRESidebarMenuItem key={item.title}>
                                  <CBRESidebarMenuButton asChild>
                                    <a href={item.url} className="flex w-full">
                                      <item.icon className="size-5 mr-2" />
                                      <span>{item.title}</span>
                                    </a>
                                  </CBRESidebarMenuButton>
                                  
                                  {item.title === "Client Projects" && (
                                    <CBRESidebarMenuSub>
                                      {teamMenuItems.map((subItem) => (
                                        <CBRESidebarMenuSubItem key={subItem.title}>
                                          <CBRESidebarMenuSubButton asChild>
                                            <a href={subItem.url} className="flex w-full">
                                              <span>{subItem.title}</span>
                                            </a>
                                          </CBRESidebarMenuSubButton>
                                        </CBRESidebarMenuSubItem>
                                      ))}
                                    </CBRESidebarMenuSub>
                                  )}
                                </CBRESidebarMenuItem>
                              ))}
                            </CBRESidebarMenu>
                          </CBRESidebarGroupContent>
                        </CBRESidebarGroup>
                      </CBRESidebarContent>
                      <CBRESidebarFooter>
                        <div className="flex items-center p-2">
                          <div className="size-8 rounded-full bg-cbre-green flex items-center justify-center text-white">
                            <UsersIcon className="size-4" />
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium">Jane Smith</div>
                            <div className="text-xs text-dark-grey">Administrator</div>
                          </div>
                        </div>
                      </CBRESidebarFooter>
                    </CBRESidebar>
                    
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="border-b border-light-grey p-4 flex items-center">
                        <CBRESidebarTrigger className="mr-4" />
                        <h2 className="text-xl font-financier text-cbre-green">Dashboard</h2>
                      </div>
                      
                      <div className="p-6 flex-1 overflow-auto">
                        <div className="max-w-2xl mx-auto">
                          <p className="text-dark-grey font-calibre mb-4">
                            This is an example of the sidebar in use with a main content area. 
                            You can toggle the sidebar open and closed using the button in the header.
                          </p>
                          <p className="text-dark-grey font-calibre mb-4">
                            The sidebar provides navigation, while the main content area displays the actual content.
                            This layout is common in dashboard applications.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CBRESidebarProvider>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBRESidebarProvider defaultOpen={true}>
  <CBRESidebar>
    <CBRESidebarHeader>
      <CBRELogo />
    </CBRESidebarHeader>
    <CBRESidebarContent>
      <CBRESidebarGroup>
        <CBRESidebarGroupLabel>Main Navigation</CBRESidebarGroupLabel>
        <CBRESidebarGroupContent>
          <CBRESidebarMenu>
            {mainMenuItems.map((item) => (
              <CBRESidebarMenuItem key={item.title}>
                <CBRESidebarMenuButton asChild isActive={item.active}>
                  <a href={item.url} className="flex w-full">
                    <item.icon className="size-5 mr-2" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <CBRESidebarMenuBadge className="ml-auto">
                        {item.badge}
                      </CBRESidebarMenuBadge>
                    )}
                  </a>
                </CBRESidebarMenuButton>
              </CBRESidebarMenuItem>
            ))}
          </CBRESidebarMenu>
        </CBRESidebarGroupContent>
      </CBRESidebarGroup>
      
      <CBRESidebarSeparator />
      
      <CBRESidebarGroup>
        <CBRESidebarGroupLabel>Projects</CBRESidebarGroupLabel>
        <CBRESidebarGroupContent>
          <CBRESidebarMenu>
            {projectMenuItems.map((item) => (
              <CBRESidebarMenuItem key={item.title}>
                <CBRESidebarMenuButton asChild>
                  <a href={item.url} className="flex w-full">
                    <item.icon className="size-5 mr-2" />
                    <span>{item.title}</span>
                  </a>
                </CBRESidebarMenuButton>
                
                {item.title === "Client Projects" && (
                  <CBRESidebarMenuSub>
                    {teamMenuItems.map((subItem) => (
                      <CBRESidebarMenuSubItem key={subItem.title}>
                        <CBRESidebarMenuSubButton asChild>
                          <a href={subItem.url} className="flex w-full">
                            <span>{subItem.title}</span>
                          </a>
                        </CBRESidebarMenuSubButton>
                      </CBRESidebarMenuSubItem>
                    ))}
                  </CBRESidebarMenuSub>
                )}
              </CBRESidebarMenuItem>
            ))}
          </CBRESidebarMenu>
        </CBRESidebarGroupContent>
      </CBRESidebarGroup>
    </CBRESidebarContent>
    <CBRESidebarFooter>
      <div className="flex items-center p-2">
        <div className="size-8 rounded-full bg-cbre-green flex items-center justify-center text-white">
          <UsersIcon className="size-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-medium">Jane Smith</div>
          <div className="text-xs text-dark-grey">Administrator</div>
        </div>
      </div>
    </CBRESidebarFooter>
  </CBRESidebar>
  
  <main>
    <header>
      <CBRESidebarTrigger />
      {/* Page title */}
    </header>
    {/* Page content */}
  </main>
</CBRESidebarProvider>`}
            </pre>
          </div>
        </div>
        
        {/* Icon Collapsible Sidebar */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Icon Collapsible Sidebar</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey relative">
              <div className="h-[500px] flex overflow-hidden">
                <CBRESidebarProvider defaultOpen={false}>
                  <div className="flex h-full w-full relative overflow-hidden">
                    <CBRESidebar collapsible="icon" className="!static !h-full !min-h-full max-w-[16rem]">
                      <CBRESidebarHeader>
                        <CBRELogo />
                      </CBRESidebarHeader>
                      <CBRESidebarContent>
                        <CBRESidebarGroup>
                          <CBRESidebarGroupLabel>Main</CBRESidebarGroupLabel>
                          <CBRESidebarGroupContent>
                            <CBRESidebarMenu>
                              {mainMenuItems.map((item) => (
                                <CBRESidebarMenuItem key={item.title}>
                                  <CBRESidebarMenuButton 
                                    asChild 
                                    isActive={item.active}
                                    tooltip={item.title}
                                  >
                                    <a href={item.url} className="flex w-full">
                                      <item.icon className="size-5 mr-2" />
                                      <span>{item.title}</span>
                                      {item.badge && (
                                        <CBRESidebarMenuBadge className="ml-auto">
                                          {item.badge}
                                        </CBRESidebarMenuBadge>
                                      )}
                                    </a>
                                  </CBRESidebarMenuButton>
                                </CBRESidebarMenuItem>
                              ))}
                            </CBRESidebarMenu>
                          </CBRESidebarGroupContent>
                        </CBRESidebarGroup>
                      </CBRESidebarContent>
                      <CBRESidebarFooter>
                        <div className="flex items-center justify-center p-2">
                          <div className="size-8 rounded-full bg-cbre-green flex items-center justify-center text-white">
                            <UsersIcon className="size-4" />
                          </div>
                        </div>
                      </CBRESidebarFooter>
                    </CBRESidebar>
                    
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="border-b border-light-grey p-4 flex items-center">
                        <CBRESidebarTrigger className="mr-4" />
                        <h2 className="text-xl font-financier text-cbre-green">Icon Sidebar Example</h2>
                      </div>
                      
                      <div className="p-6 flex-1 overflow-auto">
                        <div className="max-w-2xl mx-auto">
                          <p className="text-dark-grey font-calibre mb-4">
                            This example shows a sidebar that collapses to icons when toggled.
                            Click the toggle button to expand or collapse the sidebar.
                          </p>
                          <p className="text-dark-grey font-calibre mb-4">
                            In the collapsed state, you can still see the icons, which allows for quick navigation
                            while maximizing the space available for content.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CBRESidebarProvider>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBRESidebarProvider defaultOpen={false}>
  <CBRESidebar collapsible="icon">
    <CBRESidebarHeader>
      <Logo />
    </CBRESidebarHeader>
    <CBRESidebarContent>
      <CBRESidebarGroup>
        <CBRESidebarGroupLabel>Main</CBRESidebarGroupLabel>
        <CBRESidebarGroupContent>
          <CBRESidebarMenu>
            {items.map((item) => (
              <CBRESidebarMenuItem key={item.title}>
                <CBRESidebarMenuButton 
                  asChild 
                  isActive={item.active}
                  tooltip={item.title}
                >
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                    {item.badge && (
                      <CBRESidebarMenuBadge>
                        {item.badge}
                      </CBRESidebarMenuBadge>
                    )}
                  </a>
                </CBRESidebarMenuButton>
              </CBRESidebarMenuItem>
            ))}
          </CBRESidebarMenu>
        </CBRESidebarGroupContent>
      </CBRESidebarGroup>
    </CBRESidebarContent>
    <CBRESidebarFooter>
      {/* User profile */}
    </CBRESidebarFooter>
  </CBRESidebar>
  
  <main>
    <CBRESidebarTrigger />
    {/* Content */}
  </main>
</CBRESidebarProvider>`}
            </pre>
          </div>
        </div>
        
        {/* Floating Sidebar Variant */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Floating Sidebar Variant</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey relative">
              <div className="h-[500px] flex overflow-hidden">
                <CBRESidebarProvider defaultOpen={true}>
                  <div className="flex h-full w-full relative overflow-hidden">
                    <CBRESidebar variant="floating" className="!static !h-full !min-h-full max-w-[16rem]">
                      <CBRESidebarHeader>
                        <CBRELogo />
                      </CBRESidebarHeader>
                      <CBRESidebarContent>
                        <CBRESidebarGroup>
                          <CBRESidebarGroupLabel>Navigation</CBRESidebarGroupLabel>
                          <CBRESidebarGroupContent>
                            <CBRESidebarMenu>
                              {mainMenuItems.slice(0, 3).map((item) => (
                                <CBRESidebarMenuItem key={item.title}>
                                  <CBRESidebarMenuButton asChild isActive={item.active}>
                                    <a href={item.url} className="flex w-full">
                                      <item.icon className="size-5 mr-2" />
                                      <span>{item.title}</span>
                                    </a>
                                  </CBRESidebarMenuButton>
                                </CBRESidebarMenuItem>
                              ))}
                            </CBRESidebarMenu>
                          </CBRESidebarGroupContent>
                        </CBRESidebarGroup>
                      </CBRESidebarContent>
                    </CBRESidebar>
                    
                    <div className="flex-1 flex flex-col overflow-hidden bg-lighter-grey">
                      <div className="border-b border-light-grey p-4 flex items-center bg-white">
                        <CBRESidebarTrigger className="mr-4" />
                        <h2 className="text-xl font-financier text-cbre-green">Floating Sidebar</h2>
                      </div>
                      
                      <div className="p-6 flex-1 overflow-auto">
                        <div className="max-w-2xl mx-auto bg-white p-6 rounded-none shadow-sm">
                          <p className="text-dark-grey font-calibre mb-4">
                            This example shows the floating variant of the sidebar. The sidebar appears to float
                            above the content rather than pushing it aside.
                          </p>
                          <p className="text-dark-grey font-calibre mb-4">
                            This variant is useful when you want to maintain the visual hierarchy of the page
                            while still providing easy access to navigation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CBRESidebarProvider>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Floating Variant Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBRESidebarProvider>
  <CBRESidebar variant="floating">
    <CBRESidebarHeader>
      <Logo />
    </CBRESidebarHeader>
    <CBRESidebarContent>
      <CBRESidebarGroup>
        <CBRESidebarGroupLabel>Navigation</CBRESidebarGroupLabel>
        <CBRESidebarGroupContent>
          <CBRESidebarMenu>
            {items.map((item) => (
              <CBRESidebarMenuItem key={item.title}>
                <CBRESidebarMenuButton asChild isActive={item.active}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </CBRESidebarMenuButton>
              </CBRESidebarMenuItem>
            ))}
          </CBRESidebarMenu>
        </CBRESidebarGroupContent>
      </CBRESidebarGroup>
    </CBRESidebarContent>
  </CBRESidebar>
  
  <main>
    <CBRESidebarTrigger />
    {/* Content */}
  </main>
</CBRESidebarProvider>`}
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