-- Seed data for Wolf Studio CMS
-- This migration populates the database with existing categories and project data

-- Insert categories based on existing project categorization
INSERT INTO categories (name, slug, description) VALUES
('Consulting Firm', 'consulting-firm', 'Management consulting and professional services projects'),
('Financial Services', 'financial-services', 'Banking, insurance, and financial sector projects'),
('Corporate Office', 'corporate-office', 'General corporate office design and build projects'),
('Healthcare', 'healthcare', 'Healthcare and pharmaceutical sector projects'),
('Technology', 'technology', 'Technology company office designs'),
('Hospitality', 'hospitality', 'Hotels, restaurants, and hospitality sector projects'),
('Legal', 'legal', 'Law firms and legal sector projects'),
('Industrial', 'industrial', 'Manufacturing and industrial sector projects');

-- Insert projects with basic data from existing projects.ts
INSERT INTO projects (
    title, subtitle, slug, banner_image_url, order_index, legacy_id, 
    is_published, published_at, category_id
) VALUES
-- Consulting Firm projects
('Taipei Management', 'Consulting Firm', 'managementconsultingfirm', '/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-banner.jpg', 1, 'managementconsultingfirm', true, '2024-01-01', (SELECT id FROM categories WHERE slug = 'consulting-firm')),
('Singapore Management', 'Consulting Firm', 'managementconsultingsg', '/scraped-images/work-projects/managementconsultingsg/managementconsultingsg-banner.jpg', 3, 'managementconsultingsg', true, '2023-10-20', (SELECT id FROM categories WHERE slug = 'consulting-firm')),
('Hong Kong Management', 'Consulting Firm', 'hongkongmanagement', '/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-banner.jpg', 6, 'hongkongmanagement', true, '2023-07-30', (SELECT id FROM categories WHERE slug = 'consulting-firm')),
('Global Consulting Giant', 'Professional Services Firm', 'globalconsultinggiant', '/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-banner.jpg', 12, 'globalconsultinggiant', true, '2023-03-20', (SELECT id FROM categories WHERE slug = 'consulting-firm')),

-- Financial Services projects
('Swiss Bank', 'Financial Services', 'swissbank', '/scraped-images/work-projects/swissbank/swissbank-banner.jpg', 2, 'swissbank', true, '2023-11-15', (SELECT id FROM categories WHERE slug = 'financial-services')),
('RQAM', 'Financial Services', 'rqam', '/scraped-images/work-projects/rqam/rqam-banner.jpg', 10, 'rqam', true, '2023-04-25', (SELECT id FROM categories WHERE slug = 'financial-services')),
('MYP', 'SGX-Listed Investment Firm', 'myp', '/scraped-images/work-projects/myp/myp-banner.jpg', 19, 'myp', true, '2022-08-20', (SELECT id FROM categories WHERE slug = 'financial-services')),
('LUFAX', 'China''s Fintech Giant', 'lufax', '/scraped-images/work-projects/lufax/lufax-banner.jpg', 21, 'lufax', true, '2022-06-10', (SELECT id FROM categories WHERE slug = 'financial-services')),
('Zurich Insurance', 'Insurance Office', 'zurichinsurance', '/scraped-images/work-projects/zurichinsurance/zurichinsurance-banner.jpg', 22, 'zurichinsurance', true, '2022-05-08', (SELECT id FROM categories WHERE slug = 'financial-services')),

-- Corporate Office projects
('Heineken', 'Corporate Office', 'heineken', '/scraped-images/work-projects/heineken/heineken-banner.jpg', 4, 'heineken', true, '2023-09-05', (SELECT id FROM categories WHERE slug = 'corporate-office')),
('Bosch', 'Industrial Innovation', 'bosch', '/scraped-images/work-projects/bosch/bosch-banner.jpg', 11, 'bosch', true, '2023-04-05', (SELECT id FROM categories WHERE slug = 'corporate-office')),
('EMERSON', 'Automation Specialists', 'emerson', '/scraped-images/work-projects/emerson/emerson-banner.jpg', 13, 'emerson', true, '2023-02-15', (SELECT id FROM categories WHERE slug = 'corporate-office')),
('CBRE', 'Real Estate Services', 'cbre', '/scraped-images/work-projects/cbre/cbre-banner.jpg', 14, 'cbre', true, '2023-01-10', (SELECT id FROM categories WHERE slug = 'corporate-office')),
('Goodpack', 'Corporate Office', 'goodpack', '/scraped-images/work-projects/goodpack/goodpack-banner.jpg', 15, 'goodpack', true, '2022-12-15', (SELECT id FROM categories WHERE slug = 'corporate-office')),
('Philip Morris', 'Corporate Office', 'philipmorrissingapore', '/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-banner.jpg', 16, 'philipmorrissingapore', true, '2022-11-22', (SELECT id FROM categories WHERE slug = 'corporate-office')),
('The WOLF Den', 'Where Great Design Happens', 'thewolfden', '/scraped-images/work-projects/thewolfden/thewolfden-banner.jpg', 23, 'thewolfden', true, '2022-04-15', (SELECT id FROM categories WHERE slug = 'corporate-office')),

-- Healthcare projects
('IHH Healthcare', 'A Workplace Without Boundaries', 'ihh', '/scraped-images/work-projects/ihh/ihh-banner.jpg', 9, 'ihh', true, '2023-05-10', (SELECT id FROM categories WHERE slug = 'healthcare')),
('Iqvia', 'Healthcare Innovation', 'iqvia', '/scraped-images/work-projects/iqvia/iqvia-banner.jpg', 17, 'iqvia', true, '2022-10-18', (SELECT id FROM categories WHERE slug = 'healthcare')),
('Bayer', 'Pharmaceutical Office', 'bayer', '/scraped-images/work-projects/bayer/bayer-banner.jpg', 18, 'bayer', true, '2022-09-25', (SELECT id FROM categories WHERE slug = 'healthcare')),
('Life Science & Clinical', 'Manufacturer', 'lifesciencemanufacturer', '/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-banner.jpg', 20, 'lifesciencemanufacturer', true, '2022-07-15', (SELECT id FROM categories WHERE slug = 'healthcare')),

-- Technology projects
('Ride Hailing Giant', 'Technology Headquarters', 'ridehailinggiant', '/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-banner.jpg', 5, 'ridehailinggiant', true, '2023-08-12', (SELECT id FROM categories WHERE slug = 'technology')),
('Dassault Systemes', 'Global Leader in 3D Software', 'dassaultsystemes', '/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-banner.jpg', 24, 'dassaultsystemes', true, '2022-03-10', (SELECT id FROM categories WHERE slug = 'technology')),

-- Hospitality projects
('Homeaway', 'A Home From Home', 'homeaway', '/scraped-images/work-projects/homeaway/homeaway-banner.jpg', 7, 'homeaway', true, '2023-06-18', (SELECT id FROM categories WHERE slug = 'hospitality')),

-- Legal projects
('International Law Firm', 'Legal Office', 'internationallawfirm', '/scraped-images/work-projects/internationallawfirm/internationallawfirm-banner.jpg', 8, 'internationallawfirm', true, '2023-05-30', (SELECT id FROM categories WHERE slug = 'legal')),

-- Additional projects
('Resources', 'Bold and Professional', 'resources', '/scraped-images/work-projects/resources/resources-banner.jpg', 25, 'resources', true, '2022-02-10', (SELECT id FROM categories WHERE slug = 'corporate-office')),
('Rice Communications', 'Creative Agency', 'ricecommunications', '/scraped-images/work-projects/ricecommunications/ricecommunications-banner.jpg', 26, 'ricecommunications', true, '2022-01-15', (SELECT id FROM categories WHERE slug = 'corporate-office')),
('VV Life', 'Technology Innovation', 'vvlife', '/scraped-images/work-projects/vvlife/vvlife-banner.jpg', 27, 'vvlife', true, '2021-12-20', (SELECT id FROM categories WHERE slug = 'technology')),
('Hans im Glück', 'German Burger Grill', 'hansimgluck', '/scraped-images/work-projects/hansimgluck/hansimgluck-banner.jpg', 28, 'hansimgluck', true, '2021-11-25', (SELECT id FROM categories WHERE slug = 'hospitality'));

-- Note: Detailed project information (size, location, scope, year, description) 
-- will be populated via a separate data migration script that extracts 
-- this information from the individual project page files. 