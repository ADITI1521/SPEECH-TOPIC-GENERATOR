import base64
import marshal
import re
import string
import types


TARGET_B64 = None
XOR_KEY = None


def load_code_object(path="vault.pyc"):
    with open(path, "rb") as handle:
        handle.read(16)
        return marshal.load(handle)


def collect_constants(code_obj, strings, integers):
    for const in code_obj.co_consts:
        if isinstance(const, types.CodeType):
            collect_constants(const, strings, integers)
        elif isinstance(const, str):
            strings.add(const)
        elif isinstance(const, int) and not isinstance(const, bool):
            integers.add(const)


def looks_like_base64(value):
    if not value or len(value) % 4 != 0:
        return False
    if not re.fullmatch(r"[A-Za-z0-9+/=]+", value):
        return False
    try:
        decoded = base64.b64decode(value, validate=True)
    except Exception:
        return False
    return bool(decoded)


def score_plaintext(text):
    allowed = set(string.printable) - {"\x0b", "\x0c"}
    if any(ch not in allowed for ch in text):
        return -1

    score = sum(ch in string.ascii_letters + string.digits + "{}_-" for ch in text)

    if text.startswith("CTF{"):
        score += 1000
    if text.endswith("}"):
        score += 100
    if "flag" in text.lower():
        score += 50

    return score


def find_secret(strings, integers):
    best = None

    b64_candidates = []
    for value in strings:
        if looks_like_base64(value):
            try:
                b64_candidates.append((value, base64.b64decode(value, validate=True)))
            except Exception:
                continue

    key_candidates = [key for key in integers if 0 <= key <= 255]

    for encoded, decoded in b64_candidates:
        for key in key_candidates:
            plaintext = "".join(chr(byte ^ key) for byte in decoded)
            score = score_plaintext(plaintext)
            if score < 0:
                continue

            candidate = (score, encoded, key, plaintext)
            if best is None or candidate[0] > best[0]:
                best = candidate

    if best is None:
        raise ValueError("Unable to identify the Base64 constant and XOR key")

    _, encoded, key, plaintext = best
    return encoded, key, plaintext


def main():
    global TARGET_B64, XOR_KEY

    print("--- PHASE 1: NATIVE DECOMPILATION ---")
    code_obj = load_code_object()
    print("Bytecode loaded successfully. Disassembling into memory...")

    strings = set()
    integers = set()
    collect_constants(code_obj, strings, integers)

    TARGET_B64, XOR_KEY, result = find_secret(strings, integers)

    print()
    print("--- PHASE 2: REVERSAL ---")
    print("REVERSAL COMPLETE. The extracted password is:")
    print(result)
    print()
    print("Now run `python vault.pyc` and test your password.")


if __name__ == "__main__":
    main()
