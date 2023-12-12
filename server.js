const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader")
const packageDef = protoLoader.loadSync("products.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const productPackage = grpcObject.productPackage;

const server = new grpc.Server();

let products = [
  { id: 1, name: 'Note 1', price: "100.0", state: 'Available'},
  { id: 2, name: 'Note 2', price: "200.0", state: 'Unvailable'}
]

let orders = [

]

server.addService(productPackage.Product.service,
  {
      "getProductById": getProductById,

  });

server.addService(productPackage.Order.service,{
  "newOrder" : newOrder
})

function getProductById (call, callback) {
  
  try {
    const product = products.find(n => n.id == call.request.productId);
  
  if (product) {
      callback(null, product);
      return product;
  } else {
      callback({
          code: grpc.status.NOT_FOUND,
          details: "Not found"
      });
  }
  } catch (error) {
    console.log(error);
  }
}



function newOrder (call, callback) {
  
  try {
    const product = getProductById(call, function (error, result){ if(error){ return error } else { return result } });
    if (product) {
      console.log(product);
      const order = {
        id : orders.length + 1 ,
        productId : call.request.productId,
        quantity : call.request.quantity,
        price : product.price * call.request.quantity,
        state : "Created"
      }
      orders.push(order);

      if (product.state == "Available") {
        orders[orders.length -1].state = "Processing"
        callback(null, order);
      }else{
        orders[orders.length -1].state = "Failed"
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Product Unvailable"
        });

      }
    }else {
      callback({
          code: grpc.status.NOT_FOUND,
          details: "Not found"
      });
  }
    
  } catch (error) {
    console.log(error);
  }

}





server.bindAsync("127.0.0.1:50000", grpc.ServerCredentials.createInsecure(), (error, port) => {
  server.start();
  console.log(`listening on port ${port}`);
});