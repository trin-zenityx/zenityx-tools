declare module "heic2any" {
  type Input = {
    blob: Blob;
    toType?: string;
    quality?: number;
  };

  function heic2any(input: Input): Promise<Blob | Blob[]>;
  export default heic2any;
}
