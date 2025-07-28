import { DevEnvironment } from "vite";
import { optimizeDeps } from "../utils";
import { writePackagesClientModules } from "./packages-modules";

export default class UseClientApi {
  private appIds = new Set<string>();
  private packagesIds = new Set<string>();

  constructor(private consumerDevEnvironments: DevEnvironment[]) {}

  public async addModules(ids: string[]) {
    let shouldWrite = false;

    for (const id of ids) {
      const isPackage = isPackageModule(id);

      if (isPackage && !this.packagesIds.has(id)) {
        this.packagesIds.add(id);
        shouldWrite = true;
      } else if (!isPackage) {
        this.appIds.add(id);
      }
    }

    if (shouldWrite) await this.write();
  }

  public getAppModules() {
    return [...this.appIds];
  }

  public getModules() {
    return [...this.appIds, ...this.packagesIds];
  }

  public async removeModules(ids: string[]) {
    let shouldWrite = false;

    for (const id of ids) {
      this.appIds.delete(id);
      const packageDeleted = this.packagesIds.delete(id);

      if (packageDeleted) shouldWrite = true;
    }

    if (shouldWrite) await this.write();
  }

  private async write() {
    await writePackagesClientModules([...this.packagesIds]);

    await Promise.all(this.consumerDevEnvironments.map(optimizeDeps));
  }
}

function isPackageModule(id: string) {
  return /node_modules\//.test(id);
}
