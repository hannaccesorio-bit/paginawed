// ============================================================
// Google Apps Script — ACCESORIOS HANNA API
// ============================================================
// 1. Abre: https://script.google.com/
// 2. Crea un nuevo proyecto
// 3. Copia y pega este código
// 4. Reemplaza SPREADSHEET_ID con el ID de tu hoja
// 5. Guarda y despliega como "Web App"
//    → Ejecutar como: "Yo"
//    → Acceso: "Cualquier persona"
// 6. Copia la URL desplegada y pégala en config.js
// ============================================================

const SPREADSHEET_ID = '1VjSH7s0vlLhinPCTjQjZRNd8snON71JyYauktRxwBEg';
const SHEET_NAME = 'Productos';
const COMPANY_EMAIL = 'nalex199@gmail.com';

// --- Estructura de columnas (Productos) ---
// A: id   B: name   C: brand   D: category   E: price   F: oldPrice
// G: badge   H: material   I: movement   J: water   K: warranty   L: image   M: featured

const HEADERS = ['id', 'name', 'brand', 'category', 'price', 'oldPrice', 'badge', 'material', 'movement', 'water', 'warranty', 'image', 'featured'];
const COL_COUNT = HEADERS.length;

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  } else {
    // Ensure first row has headers
    const firstRow = sheet.getRange(1, 1, 1, COL_COUNT).getValues()[0];
    if (!firstRow[0] || firstRow[0].toString().toLowerCase() !== 'id') {
      sheet.insertRowBefore(1);
      sheet.getRange(1, 1, 1, COL_COUNT).setValues([HEADERS]);
    }
  }
  return sheet;
}

function rowsToJson(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.toString().toLowerCase());
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] && !row[1]) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      let val = row[idx];
      if (h === 'id' || h === 'price' || h === 'oldprice' || h === 'warranty') {
        val = val ? Number(val) : (h === 'oldprice' ? null : 0);
      }
      if (h === 'oldprice' && !val) val = null;
      obj[h] = val !== undefined ? val : '';
    });
    result.push(obj);
  }
  return result;
}

// --- GET: Leer productos ---
function doGet(e) {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const products = rowsToJson(rows);
  const action = e && e.parameter && e.parameter.action;

  if (action === 'get') {
    const id = parseInt(e.parameter.id);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      product: products.find(p => p.id === id)
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    products: products
  })).setMimeType(ContentService.MimeType.JSON);
}

// --- POST: Crear, actualizar o eliminar ---
function doPost(e) {
  const sheet = getSheet();
  const data = JSON.parse(e.postData.contents);
  const action = data.action || 'create';

  if (action === 'create') {
    const rows = sheet.getDataRange().getValues();
    const maxId = rows.length > 1
      ? Math.max(...rows.slice(1).map(r => Number(r[0]) || 0))
      : 0;
    const newId = maxId + 1;
    sheet.appendRow([
      newId,
      data.name || '',
      data.brand || '',
      data.category || 'men',
      Number(data.price) || 0,
      data.oldPrice ? Number(data.oldPrice) : '',
      data.badge || '',
      data.material || '',
      data.movement || '',
      data.water || '',
      Number(data.warranty) || 2,
      data.image || '',
      data.featured === true ? true : false
    ]);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      id: newId,
      message: 'Producto creado'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'update') {
    const rows = sheet.getDataRange().getValues();
    const id = Number(data.id);
    for (let i = 1; i < rows.length; i++) {
      if (Number(rows[i][0]) === id) {
        sheet.getRange(i + 1, 1, 1, COL_COUNT).setValues([[
          id,
          data.name || rows[i][1],
          data.brand || rows[i][2],
          data.category || rows[i][3],
          Number(data.price) || rows[i][4],
          data.oldPrice ? Number(data.oldPrice) : rows[i][5] || '',
          data.badge !== undefined ? data.badge : rows[i][6],
          data.material || rows[i][7],
          data.movement || rows[i][8],
          data.water || rows[i][9],
          Number(data.warranty) || rows[i][10],
          data.image !== undefined ? data.image : rows[i][11],
          data.featured !== undefined ? (data.featured === true ? true : false) : rows[i][12]
        ]]);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Producto actualizado'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'delete') {
    const rows = sheet.getDataRange().getValues();
    const id = Number(data.id);
    for (let i = 1; i < rows.length; i++) {
      if (Number(rows[i][0]) === id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Producto eliminado'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'uploadImage') {
    const imageData = data.imageData; // Base64 string
    const fileName = data.fileName || 'producto.jpg';
    if (!imageData) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No se recibió la imagen'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    const decoded = Utilities.base64Decode(imageData);
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeMap = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp' };
    const mime = mimeMap[ext] || 'image/jpeg';
    const blob = Utilities.newBlob(decoded, mime, fileName);
    const folderName = 'HANNA_Accesorios_Images';
    const folders = DriveApp.getFoldersByName(folderName);
    let folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const imageUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      imageUrl: imageUrl,
      message: 'Imagen subida'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'sendOrder') {
    const order = data.order;
    const pdfBase64 = data.pdfBase64;

    if (!order || !pdfBase64) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Faltan datos del pedido o PDF'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
      const decoded = Utilities.base64Decode(pdfBase64);
      const pdfBlob = Utilities.newBlob(decoded, 'application/pdf', 'Factura_' + order.id + '.pdf');

      // Email al cliente
      const customerHtml = '<h2>¡Gracias por tu compra, ' + order.name + '!</h2>' +
        '<p>Tu pedido <b>#' + order.id + '</b> ha sido recibido exitosamente.</p>' +
        '<h3>Resumen del pedido:</h3>' +
        '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">' +
        '<tr><th>Producto</th><th>Cant.</th><th>Total</th></tr>' +
        order.items.map(i => '<tr><td>' + i.name + '</td><td>' + i.qty + '</td><td>$' + (i.price * i.qty).toLocaleString('es-CO') + '</td></tr>').join('') +
        '</table>' +
        '<p><b>Total: $' + order.total.toLocaleString('es-CO') + '</b></p>' +
        '<p>Te contactaremos al <b>' + order.phone + '</b> para coordinar la entrega.</p>' +
        '<p>Encuentra tu factura adjunta en PDF.</p>' +
        '<hr><p style="color:#999;">ACCESORIOS HANNA — Elegancia que Inspira</p>';

      MailApp.sendEmail({
        to: order.email,
        subject: 'Factura ACCESORIOS HANNA — Pedido #' + order.id,
        htmlBody: customerHtml,
        attachments: [pdfBlob]
      });

      // Email a la empresa
      const companyHtml = '<h2>Nuevo Pedido #' + order.id + '</h2>' +
        '<p><b>Cliente:</b> ' + order.name + '</p>' +
        '<p><b>Email:</b> ' + order.email + '</p>' +
        '<p><b>Teléfono:</b> ' + order.phone + '</p>' +
        '<p><b>Dirección:</b> ' + order.address + (order.city ? ', ' + order.city : '') + '</p>' +
        (order.notes ? '<p><b>Notas:</b> ' + order.notes + '</p>' : '') +
        '<h3>Productos:</h3>' +
        '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">' +
        '<tr><th>Producto</th><th>SKU</th><th>Cant.</th><th>Precio</th><th>Total</th></tr>' +
        order.items.map(i => '<tr><td>' + i.name + '</td><td>' + (i.sku || '-') + '</td><td>' + i.qty + '</td><td>$' + i.price.toLocaleString('es-CO') + '</td><td>$' + (i.price * i.qty).toLocaleString('es-CO') + '</td></tr>').join('') +
        '</table>' +
        '<p><b>Total: $' + order.total.toLocaleString('es-CO') + '</b></p>';

      MailApp.sendEmail({
        to: COMPANY_EMAIL,
        subject: 'Nuevo Pedido #' + order.id + ' — ' + order.name,
        htmlBody: companyHtml,
        attachments: [pdfBlob]
      });

      // Guardar pedido en hoja "Pedidos"
      const orderSheet = getPedidosSheet();
      orderSheet.appendRow([
        order.id,
        new Date().toISOString(),
        order.name,
        order.email,
        order.phone,
        order.address,
        order.city || '',
        order.notes || '',
        JSON.stringify(order.items),
        order.total,
        'Recibido'
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Pedido procesado y correos enviados'
      })).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Error al procesar: ' + err.message
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === 'sendRecoveryCode') {
    const email = data.email;
    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, message: 'Correo requerido'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let recSheet = ss.getSheetByName('Recovery');
    if (!recSheet) {
      recSheet = ss.insertSheet('Recovery');
      recSheet.appendRow(['email', 'code', 'expiry']);
    }
    recSheet.appendRow([email, code, expiry]);

    MailApp.sendEmail({
      to: COMPANY_EMAIL,
      subject: 'Código de recuperación — ACCESORIOS HANNA',
      htmlBody: '<h2>Recuperación de contraseña</h2>' +
        '<p>Se solicitó un cambio de contraseña para el correo: <b>' + email + '</b></p>' +
        '<p style="font-size:28px;letter-spacing:6px;background:#f5f5f5;padding:16px;text-align:center;border-radius:8px;">' + code + '</p>' +
        '<p>Este código expira en 15 minutos.</p>' +
        '<p>Si no solicitaste este cambio, ignora este mensaje.</p>'
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true, message: 'Código enviado al correo'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'verifyRecoveryCode') {
    const email = data.email;
    const code = data.code;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const recSheet = ss.getSheetByName('Recovery');
    if (!recSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, message: 'No hay códigos solicitados'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    const rows = recSheet.getDataRange().getValues();
    let valid = false;
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][0] === email && String(rows[i][1]) === code) {
        const expiry = new Date(rows[i][2]);
        if (expiry > new Date()) { valid = true; }
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: valid, message: valid ? 'Código válido' : 'Código inválido o expirado'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'changePassword') {
    const email = data.email;
    const code = data.code;
    const password = data.password;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Verify code again
    let recSheet = ss.getSheetByName('Recovery');
    if (recSheet) {
      const rows = recSheet.getDataRange().getValues();
      let valid = false;
      for (let i = rows.length - 1; i >= 1; i--) {
        if (rows[i][0] === email && String(rows[i][1]) === code) {
          const expiry = new Date(rows[i][2]);
          if (expiry > new Date()) { valid = true; }
          break;
        }
      }
      if (!valid) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false, message: 'Código inválido o expirado'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Save to Admin sheet
    let adminSheet = ss.getSheetByName('Admin');
    if (!adminSheet) {
      adminSheet = ss.insertSheet('Admin');
      adminSheet.appendRow(['username', 'password']);
    }
    const aRows = adminSheet.getDataRange().getValues();
    let updated = false;
    for (let i = 1; i < aRows.length; i++) {
      if (aRows[i][0] === 'admin') {
        adminSheet.getRange(i + 1, 2).setValue(password);
        updated = true;
        break;
      }
    }
    if (!updated) {
      adminSheet.appendRow(['admin', password]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true, message: 'Contraseña actualizada'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Acción no reconocida'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getPedidosSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Pedidos');
  if (!sheet) {
    sheet = ss.insertSheet('Pedidos');
    sheet.appendRow(['id', 'fecha', 'nombre', 'email', 'telefono', 'direccion', 'ciudad', 'notas', 'items', 'total', 'estado']);
  }
  return sheet;
}
