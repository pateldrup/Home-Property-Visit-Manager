import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatDate, formatTime } from './formatDate';
import { Colors } from '../constants/Colors';
import { getFollowUpStatusLabel } from '../constants/propertyTypes';

export const generateVisitReport = async (visit, property) => {
  if (!visit || !property) {
    throw new Error('Visit or Property data is missing');
  }

  // Calculate Checklist Stats
  const checklist = visit.checklist || [];
  const totalItems = checklist.length;
  const completedItems = checklist.filter(c => c.checked).length;
  const incompleteItems = totalItems - completedItems;

  // Format Price safely
  const formattedPrice = property.price 
    ? `₹${property.price.toLocaleString('en-IN')}` 
    : 'N/A';

  // Extract Rating, Pros, Cons (handling fallbacks if they don't exist)
  const rating = property.rating ? `${property.rating} / 5` : 'Not Rated';
  const pros = property.pros && property.pros.length > 0 ? property.pros.join(', ') : 'None provided';
  const cons = property.cons && property.cons.length > 0 ? property.cons.join(', ') : 'None provided';

  // Group checklist by category for the report
  const groupedChecklist = checklist.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  const checklistHtml = Object.keys(groupedChecklist).map(category => {
    const itemsHtml = groupedChecklist[category].map(item => `
      <div class="checklist-item">
        <span class="status ${item.checked ? 'status-pass' : 'status-fail'}">
          ${item.checked ? '✓ PASS' : '✗ FAIL'}
        </span>
        <div class="item-details">
          <strong>${item.item}</strong>
          ${item.note ? `<br><span class="item-note">Note: ${item.note}</span>` : ''}
        </div>
      </div>
    `).join('');

    return `
      <div class="checklist-category">
        <h3>${category}</h3>
        ${itemsHtml}
      </div>
    `;
  }).join('');

  // Handle Photos (if property has images)
  let photosHtml = '';
  if (property.images && property.images.length > 0) {
    // In a real app, these would be accessible URLs. If they are local file URIs, 
    // expo-print can sometimes struggle with local file URIs depending on platform, 
    // but we'll include them if available.
    const imageTags = property.images.slice(0, 4).map(img => `
      <div class="photo-box">
        <img src="${img}" alt="Property Photo" />
      </div>
    `).join('');

    photosHtml = `
      <div class="section">
        <h2>Property Photos</h2>
        <div class="photos-grid">
          ${imageTags}
        </div>
      </div>
    `;
  }

  // HTML Template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1C2833;
          line-height: 1.6;
          margin: 0;
          padding: 30px;
          background-color: #F5F7FA;
        }
        .container {
          background-color: #FFFFFF;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #0B2035;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #0B2035;
          margin: 0;
          font-size: 28px;
          letter-spacing: 1px;
        }
        .header p {
          color: #7F8C8D;
          margin: 5px 0 0 0;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #2980B9;
          font-size: 20px;
          border-bottom: 1px solid #E0E6ED;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .grid {
          display: flex;
          flex-wrap: wrap;
          margin: -10px;
        }
        .grid-item {
          flex: 1 1 45%;
          padding: 10px;
        }
        .label {
          font-weight: bold;
          color: #7F8C8D;
          font-size: 12px;
          text-transform: uppercase;
        }
        .value {
          font-size: 16px;
          color: #1C2833;
          margin-top: 2px;
        }
        .stats-box {
          background-color: #F8F9FA;
          border: 1px solid #E0E6ED;
          border-radius: 6px;
          padding: 15px;
          display: flex;
          justify-content: space-around;
          text-align: center;
          margin-bottom: 20px;
        }
        .stat-item h4 { margin: 0; color: #7F8C8D; font-size: 12px; }
        .stat-item p { margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0B2035; }
        .stat-item.pass p { color: #27AE60; }
        .stat-item.fail p { color: #E74C3C; }
        
        .checklist-category {
          margin-bottom: 20px;
        }
        .checklist-category h3 {
          font-size: 16px;
          color: #34495E;
          background-color: #ECF0F1;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .checklist-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px dashed #E0E6ED;
        }
        .status {
          font-size: 12px;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
          margin-right: 15px;
          min-width: 60px;
          text-align: center;
        }
        .status-pass { background-color: #D5F5E3; color: #27AE60; }
        .status-fail { background-color: #FADBD8; color: #E74C3C; }
        .item-details strong { display: block; font-size: 14px; }
        .item-note { font-size: 13px; color: #7F8C8D; font-style: italic; }
        
        .photos-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        .photo-box {
          width: calc(50% - 15px);
          height: 200px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #E0E6ED;
        }
        .photo-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #BDC3C7;
          border-top: 1px solid #E0E6ED;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VisitVault</h1>
          <p>Professional Property Visit Report</p>
        </div>

        <div class="section">
          <h2>Property Information</h2>
          <div class="grid">
            <div class="grid-item">
              <div class="label">Property Name</div>
              <div class="value">${property.name || property.title || 'N/A'}</div>
            </div>
            <div class="grid-item">
              <div class="label">Type</div>
              <div class="value">${property.type || 'N/A'}</div>
            </div>
            <div class="grid-item">
              <div class="label">Price</div>
              <div class="value">${formattedPrice}</div>
            </div>
            <div class="grid-item">
              <div class="label">Address</div>
              <div class="value">${property.address || 'N/A'}, ${property.city || ''}</div>
            </div>
            <div class="grid-item">
              <div class="label">Configuration</div>
              <div class="value">${property.bedrooms || property.beds || 0} Beds • ${property.bathrooms || property.baths || 0} Baths</div>
            </div>
            <div class="grid-item">
              <div class="label">Area</div>
              <div class="value">${property.area ? property.area + ' sqft' : 'N/A'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Visit Details</h2>
          <div class="grid">
            <div class="grid-item">
              <div class="label">Date & Time</div>
              <div class="value">${formatDate(visit.date)} • ${formatTime(visit.date)}</div>
            </div>
            <div class="grid-item">
              <div class="label">Agent / Inspector</div>
              <div class="value">${visit.agent || 'N/A'}</div>
            </div>
            <div class="grid-item">
              <div class="label">Visit Status</div>
              <div class="value">${visit.status || 'N/A'}</div>
            </div>
            <div class="grid-item">
              <div class="label">Follow-up Status</div>
              <div class="value">${getFollowUpStatusLabel(visit.followUpStatus || 'NONE')}</div>
            </div>
            ${visit.notes ? `
            <div class="grid-item" style="flex: 1 1 100%;">
              <div class="label">Visit Notes</div>
              <div class="value">${visit.notes}</div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <h2>Evaluation Summary</h2>
          <div class="grid">
            <div class="grid-item">
              <div class="label">Rating</div>
              <div class="value">${rating}</div>
            </div>
            <div class="grid-item">
              <div class="label">Pros</div>
              <div class="value">${pros}</div>
            </div>
            <div class="grid-item" style="flex: 1 1 100%;">
              <div class="label">Cons</div>
              <div class="value">${cons}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Inspection Checklist</h2>
          <div class="stats-box">
            <div class="stat-item">
              <h4>Total Items</h4>
              <p>${totalItems}</p>
            </div>
            <div class="stat-item pass">
              <h4>Passed</h4>
              <p>${completedItems}</p>
            </div>
            <div class="stat-item fail">
              <h4>Failed / Needs Attn</h4>
              <p>${incompleteItems}</p>
            </div>
          </div>
          
          <div class="checklist-container">
            ${checklistHtml || '<p>No checklist data available.</p>'}
          </div>
        </div>

        ${photosHtml}

        <div class="footer">
          <p>Generated by VisitVault • ${new Date().toLocaleString()}</p>
          <p>This report is confidential and intended solely for authorized parties.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Visit Report',
      UTI: 'com.adobe.pdf'
    });
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};
