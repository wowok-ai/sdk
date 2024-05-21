import { Protocol, TxbObject, ResourceAddress } from './protocol';
export declare class Resource {
    static MAX_WORDS_LEN: number;
    static IsValidWords(words: string): boolean;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol, object: TxbObject): Resource;
    static New(protocol: Protocol, description: string): Resource;
    launch(): ResourceAddress;
    destroy(): false | undefined;
    add(name: string, object: string): void;
    remove(name: string, object: string, removeall?: boolean): void;
    rename(old_name: string, new_name: string): void;
    add_words(object: string, words: string): void;
    remove_words(object: string): void;
}
//# sourceMappingURL=resource.d.ts.map