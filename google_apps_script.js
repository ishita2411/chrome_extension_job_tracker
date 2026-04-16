function doPost(e) {
  try {
    // Replace SHEET_ID with your actual Google Sheet ID
    const SHEET_ID = '1ExXzpzurg5XjYRN3XEFVzLYqtyqJ46ptMtrXBzs1nCc';
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName('Sheet1');
    
    const data = JSON.parse(e.postData.contents);
    const jobLink = data.jobLink;
    const companyName = data.companyName
    
    // Get all values from column B (job links)
    const allValues = sheet.getRange('B:B').getValues();
    
    // Check if the job link already exists
    let linkExists = false;
    for (let i = 0; i < allValues.length; i++) {
      if (allValues[i][0] === jobLink) {
        linkExists = true;
        break;
      }
    }
    
    if (linkExists) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'duplicate',
        message: 'This job link already exists in your sheet'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // If not a duplicate, add it
    sheet.appendRow([
      companyName,
      jobLink,
      data.timestamp
    ]);
    
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