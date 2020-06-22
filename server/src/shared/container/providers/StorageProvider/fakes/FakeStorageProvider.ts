import IStorageProvider from '../models/IStorageProvider';

class FakeStorageProvider implements IStorageProvider {
  private storage: string[] = [];

  public async saveFile(file: string): Promise<string> {
    this.storage.push(file);

    return file;
  }

  public async deleteFIle(file: string): Promise<void> {
    const findIndex = this.storage.findIndex(
      storageFIle => storageFIle === file
    );

    this.storage.splice(findIndex, 1);
  }
}

export default FakeStorageProvider;
