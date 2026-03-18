function doGet() {
  return ContentService.createTextOutput("Webhook activo ✅");
}

function doPost(e) {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Hoja1");
  const pedidos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pedidos");

  const data = JSON.parse(e.postData.contents);

  Logger.log(data);

  if (data.tipo === "producto") {

    if (data.accion === "crear") {
      sheet.appendRow([
        data.id,
        data.nombre,
        data.categoria,
        data.precio,
        data.imagen,
        data.imagen2,
        data.imagen3,
        data.descripcion,
        data.oferta
      ]);
    }

    if (data.accion === "eliminar") {
      const datos = sheet.getDataRange().getValues();

      for (let i = 1; i < datos.length; i++) {
        if (datos[i][0] == data.id) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }
  }

  if (data.tipo === "pedido") {
    pedidos.appendRow([
      new Date(),
      data.nombre,
      data.telefono,
      data.direccion,
      data.productos,
      data.total,
      data.nota
    ]);
  }

  return ContentService.createTextOutput("OK");
}
