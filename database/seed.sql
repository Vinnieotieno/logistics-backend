-- Seed data for Globeflight Logistics System

-- Insert sample blog categories
INSERT INTO blog_categories (name, slug, description, is_active) VALUES
('Logistics & Supply Chain', 'logistics-supply-chain', 'Articles about logistics, supply chain management, and industry insights', true),
('Shipping & Freight', 'shipping-freight', 'Information about shipping services, freight forwarding, and international trade', true),
('Customs & Compliance', 'customs-compliance', 'Guidance on customs procedures, compliance requirements, and regulatory updates', true),
('Industry News', 'industry-news', 'Latest news and updates from the logistics and transportation industry', true),
('Company Updates', 'company-updates', 'News and announcements from Globeflight Worldwide Express', true),
('Tips & Guides', 'tips-guides', 'Helpful tips and guides for shipping and logistics', true);

-- Insert sample blog posts
INSERT INTO blogs (title, slug, short_description, content, featured_image, author_id, category_id, read_time, likes_count, views_count, is_published, is_featured, meta_title, meta_description, tags, published_at, created_at, updated_at) VALUES
(
    'The Future of Logistics: Digital Transformation in Supply Chain Management',
    'future-of-logistics-digital-transformation',
    'Discover how digital technologies are revolutionizing the logistics industry and transforming supply chain management for better efficiency and customer satisfaction.',
    '<h2>The Digital Revolution in Logistics</h2>
    <p>The logistics industry is undergoing a massive digital transformation that is reshaping how goods are transported, tracked, and delivered worldwide. From artificial intelligence to blockchain technology, new innovations are creating unprecedented opportunities for efficiency and transparency.</p>
    
    <h3>Key Technologies Driving Change</h3>
    <ul>
        <li><strong>Artificial Intelligence & Machine Learning:</strong> AI-powered route optimization, demand forecasting, and automated decision-making processes.</li>
        <li><strong>Internet of Things (IoT):</strong> Real-time tracking, smart sensors, and connected devices throughout the supply chain.</li>
        <li><strong>Blockchain Technology:</strong> Enhanced transparency, secure transactions, and immutable records for better trust and compliance.</li>
        <li><strong>Cloud Computing:</strong> Scalable infrastructure for logistics management systems and data analytics.</li>
    </ul>
    
    <h3>Benefits of Digital Transformation</h3>
    <p>Companies embracing digital transformation in logistics are experiencing:</p>
    <ul>
        <li>Improved operational efficiency by up to 30%</li>
        <li>Enhanced customer satisfaction through real-time visibility</li>
        <li>Reduced costs through optimized routes and inventory management</li>
        <li>Better compliance and risk management</li>
    </ul>
    
    <blockquote>
        "Digital transformation is not just about technology; it''s about reimagining how we deliver value to customers in an increasingly connected world." - Logistics Industry Expert
    </blockquote>
    
    <h3>Challenges and Solutions</h3>
    <p>While the benefits are clear, implementing digital transformation comes with challenges:</p>
    <ul>
        <li><strong>Integration Complexity:</strong> Legacy systems need to be integrated with new digital solutions</li>
        <li><strong>Data Security:</strong> Protecting sensitive information in an interconnected environment</li>
        <li><strong>Skill Gaps:</strong> Training employees to work with new technologies</li>
    </ul>
    
    <h3>Looking Ahead</h3>
    <p>The future of logistics is bright, with emerging technologies like autonomous vehicles, drones, and advanced robotics set to further revolutionize the industry. Companies that adapt quickly will gain significant competitive advantages.</p>
    
    <p>At Globeflight Worldwide Express, we''re committed to staying at the forefront of these technological advances to provide our customers with the most efficient and reliable logistics solutions.</p>',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    1,
    1,
    8,
    45,
    1200,
    true,
    true,
    'The Future of Logistics: Digital Transformation in Supply Chain Management',
    'Discover how digital technologies are revolutionizing the logistics industry and transforming supply chain management for better efficiency.',
    ARRAY['logistics', 'digital transformation', 'supply chain', 'technology', 'innovation'],
    NOW(),
    NOW(),
    NOW()
),
(
    'Essential Guide to International Shipping Documentation',
    'essential-guide-international-shipping-documentation',
    'Master the essential documents required for international shipping and learn how to avoid common pitfalls that can delay your shipments.',
    '<h2>Understanding International Shipping Documentation</h2>
    <p>International shipping requires careful attention to documentation to ensure smooth customs clearance and timely delivery. Missing or incorrect documents can lead to delays, additional costs, and even shipment rejection.</p>
    
    <h3>Essential Documents for International Shipping</h3>
    
    <h4>1. Commercial Invoice</h4>
    <p>The commercial invoice is the most important document for international shipments. It must include:</p>
    <ul>
        <li>Detailed description of goods</li>
        <li>Quantity and unit prices</li>
        <li>Total value in the currency of the transaction</li>
        <li>Country of origin</li>
        <li>Harmonized System (HS) codes</li>
    </ul>
    
    <h4>2. Packing List</h4>
    <p>A detailed packing list helps customs officials verify the contents of your shipment:</p>
    <ul>
        <li>Item-by-item breakdown of contents</li>
        <li>Dimensions and weights</li>
        <li>Package counts</li>
        <li>Special handling instructions</li>
    </ul>
    
    <h4>3. Bill of Lading (BOL)</h4>
    <p>This document serves as a contract between the shipper and carrier:</p>
    <ul>
        <li>Proof of ownership</li>
        <li>Carrier''s receipt of goods</li>
        <li>Delivery instructions</li>
    </ul>
    
    <h4>4. Certificate of Origin</h4>
    <p>Required for preferential trade agreements and certain product categories.</p>
    
    <h3>Country-Specific Requirements</h3>
    <p>Different countries have varying documentation requirements:</p>
    <ul>
        <li><strong>United States:</strong> Importer Security Filing (ISF) for ocean shipments</li>
        <li><strong>European Union:</strong> EUR.1 certificate for preferential origin</li>
        <li><strong>China:</strong> Special requirements for food and pharmaceutical products</li>
    </ul>
    
    <h3>Common Mistakes to Avoid</h3>
    <ul>
        <li>Incomplete or inaccurate commercial invoices</li>
        <li>Missing or incorrect HS codes</li>
        <li>Inadequate product descriptions</li>
        <li>Failure to include required certificates</li>
    </ul>
    
    <blockquote>
        "Proper documentation is the foundation of successful international shipping. Take the time to get it right the first time." - Customs Expert
    </blockquote>
    
    <h3>Tips for Success</h3>
    <ol>
        <li>Start documentation preparation early</li>
        <li>Double-check all information for accuracy</li>
        <li>Keep copies of all documents</li>
        <li>Work with experienced logistics partners</li>
        <li>Stay updated on regulatory changes</li>
    </ol>
    
    <p>At Globeflight Worldwide Express, our experienced team ensures all documentation is properly prepared and submitted, helping you avoid delays and additional costs.</p>',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2111&q=80',
    1,
    2,
    10,
    32,
    890,
    true,
    false,
    'Essential Guide to International Shipping Documentation',
    'Master the essential documents required for international shipping and learn how to avoid common pitfalls.',
    ARRAY['shipping', 'documentation', 'international trade', 'customs', 'logistics'],
    NOW(),
    NOW(),
    NOW()
),
(
    'Customs Clearance: A Complete Guide for Importers and Exporters',
    'customs-clearance-complete-guide-importers-exporters',
    'Navigate the complex world of customs clearance with our comprehensive guide covering procedures, requirements, and best practices for smooth operations.',
    '<h2>Understanding Customs Clearance</h2>
    <p>Customs clearance is the process of getting permission from customs authorities to import or export goods. It involves submitting documentation, paying duties and taxes, and ensuring compliance with regulations.</p>
    
    <h3>The Customs Clearance Process</h3>
    
    <h4>Step 1: Documentation Preparation</h4>
    <p>Before goods arrive at the border, ensure all required documents are ready:</p>
    <ul>
        <li>Commercial invoice</li>
        <li>Packing list</li>
        <li>Bill of lading or airway bill</li>
        <li>Import/export permits (if required)</li>
        <li>Certificate of origin</li>
    </ul>
    
    <h4>Step 2: Customs Declaration</h4>
    <p>Submit a customs declaration with detailed information about your shipment:</p>
    <ul>
        <li>Product descriptions and quantities</li>
        <li>Value declarations</li>
        <li>Country of origin</li>
        <li>Intended use of goods</li>
    </ul>
    
    <h4>Step 3: Assessment and Payment</h4>
    <p>Customs authorities will:</p>
    <ul>
        <li>Assess applicable duties and taxes</li>
        <li>Calculate import/export fees</li>
        <li>Issue payment instructions</li>
    </ul>
    
    <h4>Step 4: Inspection (if required)</h4>
    <p>Some shipments may be selected for physical inspection to verify:</p>
    <ul>
        <li>Document accuracy</li>
        <li>Product compliance</li>
        <li>Value declarations</li>
    </ul>
    
    <h3>Common Challenges and Solutions</h3>
    
    <h4>1. Classification Issues</h4>
    <p><strong>Challenge:</strong> Incorrect HS code classification<br>
    <strong>Solution:</strong> Work with customs experts or use official classification tools</p>
    
    <h4>2. Valuation Disputes</h4>
    <p><strong>Challenge:</strong> Customs questioning declared values<br>
    <strong>Solution:</strong> Provide detailed pricing documentation and market research</p>
    
    <h4>3. Documentation Errors</h4>
    <p><strong>Challenge:</strong> Missing or incorrect documents<br>
    <strong>Solution:</strong> Implement thorough documentation review processes</p>
    
    <h3>Best Practices for Smooth Clearance</h3>
    <ol>
        <li><strong>Plan Ahead:</strong> Start documentation preparation early</li>
        <li><strong>Use Experienced Partners:</strong> Work with customs brokers or logistics experts</li>
        <li><strong>Stay Compliant:</strong> Keep up with regulatory changes</li>
        <li><strong>Maintain Records:</strong> Keep detailed records of all transactions</li>
        <li><strong>Build Relationships:</strong> Develop good relationships with customs officials</li>
    </ol>
    
    <h3>Technology in Customs Clearance</h3>
    <p>Modern customs clearance is increasingly digital:</p>
    <ul>
        <li>Electronic documentation submission</li>
        <li>Automated risk assessment</li>
        <li>Real-time tracking and updates</li>
        <li>Digital payment systems</li>
    </ul>
    
    <blockquote>
        "Efficient customs clearance is the result of careful planning, accurate documentation, and strong partnerships with experienced professionals." - Customs Expert
    </blockquote>
    
    <h3>Working with Globeflight</h3>
    <p>Our customs clearance experts handle the entire process for you, ensuring:</p>
    <ul>
        <li>Accurate documentation preparation</li>
        <li>Proper classification and valuation</li>
        <li>Timely submission and follow-up</li>
        <li>Resolution of any issues that arise</li>
    </ul>
    
    <p>Contact us today to learn how we can streamline your customs clearance process.</p>',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    1,
    3,
    12,
    28,
    756,
    true,
    false,
    'Customs Clearance: A Complete Guide for Importers and Exporters',
    'Navigate the complex world of customs clearance with our comprehensive guide covering procedures and best practices.',
    ARRAY['customs', 'clearance', 'import', 'export', 'compliance'],
    NOW(),
    NOW(),
    NOW()
),
(
    'E-commerce Logistics: Meeting the Demands of Online Retail',
    'ecommerce-logistics-meeting-demands-online-retail',
    'Explore how e-commerce is transforming logistics requirements and discover strategies for meeting the growing demands of online retail.',
    '<h2>The E-commerce Logistics Revolution</h2>
    <p>The explosive growth of e-commerce has fundamentally changed logistics requirements, creating new challenges and opportunities for businesses worldwide. From same-day delivery expectations to complex return processes, the logistics landscape is evolving rapidly.</p>
    
    <h3>Key Challenges in E-commerce Logistics</h3>
    
    <h4>1. Speed and Efficiency</h4>
    <p>Modern consumers expect:</p>
    <ul>
        <li>Same-day or next-day delivery</li>
        <li>Real-time tracking updates</li>
        <li>Flexible delivery options</li>
        <li>Transparent pricing</li>
    </ul>
    
    <h4>2. Last-Mile Delivery</h4>
    <p>The final leg of delivery presents unique challenges:</p>
    <ul>
        <li>Urban congestion and parking restrictions</li>
        <li>Customer availability and preferences</li>
        <li>Package security and delivery confirmation</li>
        <li>Cost optimization</li>
    </ul>
    
    <h4>3. Returns Management</h4>
    <p>E-commerce returns are significantly higher than traditional retail:</p>
    <ul>
        <li>Easy return processes</li>
        <li>Quick refund processing</li>
        <li>Product inspection and restocking</li>
        <li>Reverse logistics optimization</li>
    </ul>
    
    <h3>Technology Solutions</h3>
    
    <h4>Automation and Robotics</h4>
    <p>Modern warehouses are increasingly automated:</p>
    <ul>
        <li>Automated picking and packing systems</li>
        <li>Robotic sorting and handling</li>
        <li>AI-powered inventory management</li>
        <li>Predictive analytics for demand forecasting</li>
    </ul>
    
    <h4>Digital Platforms</h4>
    <p>Technology platforms streamline operations:</p>
    <ul>
        <li>Order management systems</li>
        <li>Warehouse management software</li>
        <li>Transportation management systems</li>
        <li>Customer relationship management tools</li>
    </ul>
    
    <h3>Best Practices for E-commerce Logistics</h3>
    
    <h4>1. Multi-Channel Fulfillment</h4>
    <p>Implement strategies that work across all sales channels:</p>
    <ul>
        <li>Unified inventory management</li>
        <li>Consistent customer experience</li>
        <li>Optimized warehouse locations</li>
        <li>Flexible fulfillment options</li>
    </ul>
    
    <h4>2. Data-Driven Decision Making</h4>
    <p>Leverage data to optimize operations:</p>
    <ul>
        <li>Customer behavior analysis</li>
        <li>Demand forecasting</li>
        <li>Route optimization</li>
        <li>Performance metrics tracking</li>
    </ul>
    
    <h4>3. Customer-Centric Approach</h4>
    <p>Focus on customer satisfaction:</p>
    <ul>
        <li>Multiple delivery options</li>
        <li>Proactive communication</li>
        <li>Easy returns process</li>
        <li>Transparent pricing</li>
    </ul>
    
    <h3>Future Trends</h3>
    <p>The future of e-commerce logistics includes:</p>
    <ul>
        <li><strong>Drone Delivery:</strong> Autonomous aerial delivery for small packages</li>
        <li><strong>Autonomous Vehicles:</strong> Self-driving delivery vehicles</li>
        <li><strong>Micro-Fulfillment Centers:</strong> Small, urban warehouses for faster delivery</li>
        <li><strong>Sustainable Practices:</strong> Eco-friendly packaging and delivery options</li>
    </ul>
    
    <blockquote>
        "E-commerce logistics is not just about moving products; it''s about creating exceptional customer experiences that drive loyalty and growth." - E-commerce Expert
    </blockquote>
    
    <h3>Globeflight''s E-commerce Solutions</h3>
    <p>We offer comprehensive e-commerce logistics services:</p>
    <ul>
        <li>Fulfillment center operations</li>
        <li>Last-mile delivery solutions</li>
        <li>Returns management</li>
        <li>Technology integration</li>
        <li>International e-commerce support</li>
    </ul>
    
    <p>Contact us to learn how we can help optimize your e-commerce logistics operations.</p>',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    1,
    1,
    9,
    38,
    1020,
    true,
    false,
    'E-commerce Logistics: Meeting the Demands of Online Retail',
    'Explore how e-commerce is transforming logistics requirements and discover strategies for meeting growing demands.',
    ARRAY['ecommerce', 'logistics', 'online retail', 'fulfillment', 'delivery'],
    NOW(),
    NOW(),
    NOW()
),
(
    'Sustainable Logistics: Green Practices for Modern Supply Chains',
    'sustainable-logistics-green-practices-modern-supply-chains',
    'Discover how sustainable practices are reshaping logistics and learn how companies can implement green initiatives while maintaining efficiency.',
    '<h2>The Green Revolution in Logistics</h2>
    <p>Sustainability is no longer optional in modern logistics. Companies worldwide are implementing green practices to reduce environmental impact while improving efficiency and meeting customer expectations for responsible business practices.</p>
    
    <h3>Key Areas of Sustainable Logistics</h3>
    
    <h4>1. Green Transportation</h4>
    <p>Transportation accounts for a significant portion of logistics emissions:</p>
    <ul>
        <li><strong>Electric Vehicles:</strong> Zero-emission delivery vehicles</li>
        <li><strong>Alternative Fuels:</strong> Biofuels, hydrogen, and natural gas</li>
        <li><strong>Route Optimization:</strong> Reduce fuel consumption through efficient routing</li>
        <li><strong>Intermodal Transport:</strong> Combine different transportation modes</li>
    </ul>
    
    <h4>2. Sustainable Packaging</h4>
    <p>Packaging choices significantly impact environmental footprint:</p>
    <ul>
        <li>Recyclable and biodegradable materials</li>
        <li>Right-sizing packages to reduce waste</li>
        <li>Reusable packaging solutions</li>
        <li>Minimalist packaging design</li>
    </ul>
    
    <h4>3. Energy-Efficient Warehousing</h4>
    <p>Modern warehouses can be designed for sustainability:</p>
    <ul>
        <li>Solar power installations</li>
        <li>LED lighting systems</li>
        <li>Smart climate control</li>
        <li>Energy-efficient equipment</li>
    </ul>
    
    <h3>Benefits of Sustainable Logistics</h3>
    
    <h4>Environmental Impact</h4>
    <ul>
        <li>Reduced carbon emissions</li>
        <li>Lower energy consumption</li>
        <li>Decreased waste generation</li>
        <li>Conservation of natural resources</li>
    </ul>
    
    <h4>Business Benefits</h4>
    <ul>
        <li>Cost savings through efficiency improvements</li>
        <li>Enhanced brand reputation</li>
        <li>Compliance with regulations</li>
        <li>Competitive advantage</li>
    </ul>
    
    <h3>Implementation Strategies</h3>
    
    <h4>1. Assessment and Planning</h4>
    <p>Start with a comprehensive sustainability audit:</p>
    <ul>
        <li>Measure current environmental impact</li>
        <li>Identify improvement opportunities</li>
        <li>Set realistic goals and timelines</li>
        <li>Develop implementation roadmap</li>
    </ul>
    
    <h4>2. Technology Integration</h4>
    <p>Leverage technology for sustainability:</p>
    <ul>
        <li>IoT sensors for monitoring</li>
        <li>AI for optimization</li>
        <li>Blockchain for transparency</li>
        <li>Data analytics for insights</li>
    </ul>
    
    <h4>3. Partner Collaboration</h4>
    <p>Work with suppliers and partners:</p>
    <ul>
        <li>Establish sustainability standards</li>
        <li>Share best practices</li>
        <li>Collaborate on green initiatives</li>
        <li>Monitor and report progress</li>
    </ul>
    
    <h3>Measuring Success</h3>
    <p>Track key sustainability metrics:</p>
    <ul>
        <li>Carbon footprint reduction</li>
        <li>Energy consumption per unit</li>
        <li>Waste reduction percentages</li>
        <li>Recycling rates</li>
        <li>Cost savings achieved</li>
    </ul>
    
    <h3>Future Trends</h3>
    <p>Emerging sustainable logistics trends include:</p>
    <ul>
        <li><strong>Circular Economy:</strong> Closed-loop supply chains</li>
        <li><strong>Carbon Neutrality:</strong> Net-zero emissions targets</li>
        <li><strong>Renewable Energy:</strong> 100% renewable power sources</li>
        <li><strong>Biodegradable Materials:</strong> Natural packaging solutions</li>
    </ul>
    
    <blockquote>
        "Sustainable logistics is not just about being green; it''s about creating value through efficiency, innovation, and responsible business practices." - Sustainability Expert
    </blockquote>
    
    <h3>Globeflight''s Commitment to Sustainability</h3>
    <p>We''re committed to sustainable logistics practices:</p>
    <ul>
        <li>Carbon-neutral shipping options</li>
        <li>Eco-friendly packaging solutions</li>
        <li>Energy-efficient operations</li>
        <li>Transparent sustainability reporting</li>
    </ul>
    
    <p>Join us in building a more sustainable future for logistics.</p>',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    1,
    1,
    11,
    42,
    1150,
    true,
    false,
    'Sustainable Logistics: Green Practices for Modern Supply Chains',
    'Discover how sustainable practices are reshaping logistics and learn how companies can implement green initiatives.',
    ARRAY['sustainability', 'green logistics', 'environmental', 'supply chain', 'eco-friendly'],
    NOW(),
    NOW(),
    NOW()
);

-- Insert sample blog comments
INSERT INTO blog_comments (blog_id, name, email, comment, is_approved, created_at) VALUES
(1, 'John Smith', 'john.smith@email.com', 'Great article! The insights about AI in logistics are spot on. We''ve been implementing some of these technologies and the results are impressive.', true, NOW() - INTERVAL '2 days'),
(1, 'Sarah Johnson', 'sarah.j@company.com', 'Very informative piece. I especially liked the section about blockchain technology. Do you have any specific examples of companies successfully implementing these solutions?', true, NOW() - INTERVAL '1 day'),
(2, 'Mike Chen', 'mike.chen@logistics.com', 'This guide saved me hours of research. The documentation checklist is comprehensive and easy to follow. Thanks for sharing!', true, NOW() - INTERVAL '3 days'),
(2, 'Lisa Wang', 'lisa.wang@import.com', 'Excellent resource for anyone dealing with international shipping. The country-specific requirements section is particularly helpful.', true, NOW() - INTERVAL '5 days'),
(3, 'David Brown', 'david.brown@trade.com', 'Customs clearance can be a nightmare without proper guidance. This article breaks down the process clearly. Well done!', true, NOW() - INTERVAL '4 days'),
(4, 'Emma Wilson', 'emma.wilson@ecommerce.com', 'As an e-commerce business owner, this article hits all the key points. The section on returns management is especially relevant for our operations.', true, NOW() - INTERVAL '2 days'),
(5, 'Alex Green', 'alex.green@eco.com', 'Sustainability in logistics is crucial for our future. This article provides practical steps that companies can implement immediately.', true, NOW() - INTERVAL '1 day');

-- Insert sample newsletter subscriptions
INSERT INTO newsletter_subscriptions (email, is_active, subscribed_at) VALUES
('john.doe@example.com', true, NOW() - INTERVAL '30 days'),
('jane.smith@company.com', true, NOW() - INTERVAL '25 days'),
('mike.wilson@business.com', true, NOW() - INTERVAL '20 days'),
('sarah.jones@email.com', true, NOW() - INTERVAL '15 days'),
('david.brown@logistics.com', true, NOW() - INTERVAL '10 days'),
('lisa.chen@import.com', true, NOW() - INTERVAL '5 days'),
('alex.garcia@trade.com', true, NOW() - INTERVAL '3 days'),
('emma.davis@shipping.com', true, NOW() - INTERVAL '1 day'); 