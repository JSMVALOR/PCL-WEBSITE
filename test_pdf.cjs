try {
  require('jspdf');
  require('jspdf-autotable');
  console.log("Libraries present");
} catch(e) {
  console.log(e.message);
}
