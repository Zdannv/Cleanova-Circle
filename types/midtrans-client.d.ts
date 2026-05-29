declare module "midtrans-client" {
  // Minimal ambient typing untuk SDK midtrans-client.
  // SDK aslinya CommonJS tanpa .d.ts; kita cukup export default with Snap & CoreApi
  // sehingga TypeScript tidak komplain.

  type ClientOptions = {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  };

  class Snap {
    constructor(options: ClientOptions);
    createTransaction(params: any): Promise<{ token: string; redirect_url: string }>;
    createTransactionToken(params: any): Promise<string>;
    createTransactionRedirectUrl(params: any): Promise<string>;
  }

  class CoreApi {
    constructor(options: ClientOptions);
    transaction: {
      notification(payload: any): Promise<any>;
      status(orderId: string): Promise<any>;
      cancel(orderId: string): Promise<any>;
      expire(orderId: string): Promise<any>;
    };
  }

  const _default: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export default _default;
  export { Snap, CoreApi };
}
