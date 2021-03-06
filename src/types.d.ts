export interface IWixService {
    getStyleParams(): Promise<{}[]>;
    listenToStyleParamsChange(cb: any): void;
    isEditorMode(): boolean;
    isPreviewMode(): boolean;
    isStandaloneMode(): boolean;
    shouldRunAsStandalone(): boolean;
    withoutStyleCapabilites(): boolean;
}
