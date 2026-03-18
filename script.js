function doGet() {
  return ContentService
    .createTextOutput("Webhook activo ✅")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {

  try {

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("Error: No data");
    }

    const data = JSON.parse(e.postData.contents);
    Logger.log("DATA RECIBIDA: " + JSON.stringify(data));

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Hoja1");
    const pedidos = ss.getSheetByName("Pedidos");

    if (!sheet) {
      return ContentService.createTextOutput("Error: Hoja1 no existe");
    }

    // 📦 PRODUCTOS
    if (data.tipo === "producto") {

      if (data.accion === "crear") {

        sheet.appendRow([
          data.id || "",
          data.nombre || "",
          data.categoria || "",
          data.precio || "",
          data.imagen || "",
          data.imagen2 || "",
          data.imagen3 || "",
          data.descripcion || "",
          data.oferta || ""
        ]);

        Logger.log("Producto agregado correctamente");

      }

      if (data.accion === "eliminar") {

        const datos = sheet.getDataRange().getValues();

        for (let i = 1; i < datos.length; i++) {
          if (datos[i][0] == data.id) {
            sheet.deleteRow(i + 1);
            Logger.log("Producto eliminado");
            break;
          }
        }
      }
    }

    // 🧾 PEDIDOS
    if (data.tipo === "pedido") {

      if (!pedidos) {
        return ContentService.createTextOutput("Error: hoja Pedidos no existe");
      }

      pedidos.appendRow([
        new Date(),
        data.nombre || "",
        data.telefono || "",
        data.direccion || "",
        data.productos || "",
        data.total || "",
        data.nota || ""
      ]);

      Logger.log("Pedido guardado");
    }

    return ContentService
      .createTextOutput("OK")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {

    Logger.log("ERROR: " + error);

    return ContentService
      .createTextOutput("Error: " + error)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
