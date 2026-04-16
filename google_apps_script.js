function doPost(e) {
  try {
    // Replace SHEET_ID with your actual Google Sheet ID
    const SHEET_ID = '1ExXzpzurg5XjYRN3XEFVzLYqtyqJ46ptMtrXBzs1nCc';
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName('Sheet1');
    
    const data = JSON.parse(e.postData.contents);
    const jobLink = data.jobLink;
    const companyName = data.companyName;
    
    // Get only the used range (much faster than reading entire columns)
    const lastRow = sheet.getLastRow();
    let allValues = [];
    
    if (lastRow > 0) {
      allValues = sheet.getRange(1, 1, lastRow, 2).getValues();
    }
    
    // Step 1: Check if the job link already exists
    for (let i = 0; i < allValues.length; i++) {
      if (allValues[i][1] === jobLink) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'duplicate',
          message: 'This job link already exists in your sheet'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Step 2: Check if the company exists
    let companyRowIndex = -1;
    for (let i = 0; i < allValues.length; i++) {
      if (allValues[i][0] === companyName) {
        companyRowIndex = i;
        break;
      }
    }
    
    if (companyRowIndex !== -1) {
      // Company exists, insert a new row above it
      sheet.insertRows(companyRowIndex + 1, 1);
      sheet.getRange(companyRowIndex + 1, 1, 1, 3).setValues([[companyName, jobLink, data.timestamp]]);
    } else {
      // Company doesn't exist, append at the end
      sheet.appendRow([companyName, jobLink, data.timestamp]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Job link saved'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}