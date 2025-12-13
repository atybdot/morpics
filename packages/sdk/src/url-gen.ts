import {
  type TransformationQuerySchema,
  transformationQuerySchema,
} from "./schema";

interface props {
  bucketId: string;
  imageKey: string;
}

export class URLBuilder {
  private transformation: Partial<TransformationQuerySchema> = {};
  private imageKey;
  private bucketId;
  private API_ENDPOINT = process.env.API_ENDPOINT!;
  constructor({ bucketId, imageKey }: props) {
    this.bucketId = bucketId;
    this.imageKey = imageKey;
    if (this.API_ENDPOINT === undefined || !this.API_ENDPOINT) {
      throw new Error("No API_ENDPOINT found");
    }
  }

  public height(h: number) {
    this.transformation.h = h;
    return this;
  }
  public width(w: number) {
    this.transformation.w = w;
    return this;
  }

  public format(format: TransformationQuerySchema["format"]) {
    this.transformation.format = format;
    return this;
  }

  public blur(arg: TransformationQuerySchema["blur"]) {
    this.transformation.blur = arg;
    return this;
  }
  public grayscale(arg: TransformationQuerySchema["grayscale"]) {
    this.transformation.grayscale = arg;
    return this;
  }
  public fit(arg: TransformationQuerySchema["fit"]) {
    this.transformation.fit = arg;
    return this;
  }
  public position(arg: TransformationQuerySchema["position"]) {
    this.transformation.position = arg;
    return this;
  }
  public quality(arg: TransformationQuerySchema["quality"]) {
    this.transformation.quality = arg;
    return this;
  }
  public keepMetadata() {
    this.transformation.keepMetadata = true;
    return this;
  }

  public toSrc() {
    const data = transformationQuerySchema.parse(this.transformation);
    const params: Record<string, string> = {};

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue;
        if (typeof value === "object") {
          params[key] = JSON.stringify(value);
        } else {
          params[key] = String(value);
        }
      }
    }
    const url = new URL(this.API_ENDPOINT);
    url.pathname = `${this.bucketId}/${this.imageKey}`;
    url.search = new URLSearchParams(params).toString();
    return url.href;
  }
}

export function generateUrl(args: props): URLBuilder {
  return new URLBuilder({ bucketId: args.bucketId, imageKey: args.imageKey });
}
