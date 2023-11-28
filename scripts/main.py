import json
import os
import random
import shutil

def filename_to_prompt(str):
    prompt_str = str[:-4].replace("_", " ")
    prompt_str = prompt_str[0].upper() + prompt_str[1:]
    return prompt_str

def setup(config):
    assets_dir = "./assets"
    admin_dir = "./admin"
    if os.path.exists(assets_dir) and os.path.isdir(assets_dir):
        check = input("Will reset assets directory, are you sure? Y/[N]")
        if 'y' not in check.lower():
            exit()
        shutil.rmtree(assets_dir)
        os.makedirs(assets_dir, exist_ok=True)
        os.makedirs(os.path.join(assets_dir, "0"), exist_ok=True)
        os.makedirs(os.path.join(assets_dir, "1"), exist_ok=True)

    video_dir = config["dir"]
    versions = [config["method"]] + config["comparisons"]

    info = []
    files = []
    vers = []

    for i in range(1, len(versions)):
        for (_, _, filenames) in os.walk(os.path.join(video_dir, versions[i])):
            files += filenames
            for j in range(len(filenames)):
                ver = [0, i]
                if random.random() < 0.5:
                    ver = ver[::-1]
                vers.append(ver)

    prompts = list(map(filename_to_prompt, files))
    dsts = []
    pmts = []

    perm = list(range(len(files)))
    random.shuffle(perm)

    for ii in range(len(perm)):
        i = perm[ii]
        order = [versions[vers[i][0]], versions[vers[i][1]]]
        info.append({
            "file": files[i],
            "prompt": prompts[i],
            "order": order
        })
        pmts.append(prompts[i])
        for j in range(len(order)):
            src = os.path.join(video_dir, order[j], files[i])
            dst = os.path.join(assets_dir, str(j), str(ii) + ".mp4")
            shutil.copy(src, dst)
        dsts.append(str(ii) + ".mp4")

    print(pmts)
    print(dsts)

    with open(os.path.join(assets_dir, "info.js"), "w") as f:
        f.write(
            "var filenames = " + str(dsts) + ";\n" +
            "var prompts = " + str(pmts) + ";"
        )

    with open(os.path.join(admin_dir, "info.js"), "w") as f:
        f.write(
            "var versions = " + str(versions) + ";"
        )
    
    with open("info.json", "w") as f:
        json.dump(info, f)

if __name__ == "__main__":
    random.seed(0)
    with open("./experiment.json", "r") as f:
        config = json.load(f)
    setup(config)