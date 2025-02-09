import * as p from "@clack/prompts";
import { Command } from "commander";

import { CREATE_ZCRM_WIDGET, DEFAULT_APP_NAME } from "~/consts.js";
import {
  AvailableFrameworks,
  availableFrameworks,
  type AvailablePackages,
} from "~/installers/index.js";
import { getVersion } from "~/utils/getVersion.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { IsTTYError } from "~/utils/isTTYError.js";
import { logger } from "~/utils/logger.js";
import { validateAppName } from "~/utils/validateAppName.js";
import { validateImportAlias } from "~/utils/validateImportAlias.js";

interface CliFlags {
  noGit: boolean;
  noInstall: boolean;
  default: boolean;
  importAlias: string;
  tailwind: boolean;
}

interface CliResults {
  appName: string;
  packages: AvailablePackages[];
  flags: CliFlags;
  framework: AvailableFrameworks;
}

const defaultOptions: CliResults = {
  appName: DEFAULT_APP_NAME,
  packages: ["tailwind"],
  flags: {
    noGit: false,
    noInstall: false,
    default: false,
    tailwind: false,
    importAlias: "~/",
  },
  framework: availableFrameworks[0],
};

export const runCli = async (): Promise<CliResults> => {
  const cliResults = defaultOptions;

  const program = new Command()
    .name(CREATE_ZCRM_WIDGET)
    .description("A CLI for creating Zoho CRM widgets using React and Vite.")
    .argument(
      "[dir]",
      "The name of the application, as well as the name of the directory to create"
    )
    .option(
      "--noGit",
      "Explicitly tell the CLI to not initialize a new git repo in the project",
      false
    )
    .option(
      "--noInstall",
      "Explicitly tell the CLI to not run the package manager's install command",
      false
    )
    .option(
      "-y, --default",
      "Bypass the CLI and use all default options to bootstrap a new zcrm-widget",
      false
    )
    .option(
      "--tailwind",
      "Explicitly tell the CLI to install Tailwind CSS.",
      false
    )
    .option(
      "-i, --import-alias",
      "Explicitly tell the CLI to use a custom import alias",
      defaultOptions.flags.importAlias
    )
    .version(getVersion(), "-v, --version", "Display the version number")
    .parse(process.argv);

  // Needs to be separated outside the if statement to correctly infer the type as string | undefined
  const cliProvidedName = program.args[0];
  if (cliProvidedName) {
    cliResults.appName = cliProvidedName;
  }

  cliResults.flags = program.opts();

  if (cliResults.flags.default) {
    return cliResults;
  }

  // Explained below why this is in a try/catch block
  try {
    if (process.env.TERM_PROGRAM?.toLowerCase().includes("mintty")) {
      logger.warn(`  WARNING: It looks like you are using MinTTY, which is non-interactive. This is most likely because you are
  using Git Bash. If that's that case, please use Git Bash from another terminal, such as Windows Terminal.`);

      throw new IsTTYError("Non-interactive environment");
    }

    const pkgManager = getUserPkgManager();

    const project = await p.group(
      {
        ...(!cliProvidedName && {
          name: () =>
            p.text({
              message: "What will your project be called?",
              defaultValue: cliProvidedName,
              validate: validateAppName,
            }),
        }),
        framework: () => {
          return p.select({
            message: "Which framework would you like to use? (Vanilla HTML/CSS/JS coming soon)",
            options: [
              // { value: "none", label: "None" },
              { value: "react", label: "React" },
              { value: "vue", label: "Vue" },
              // { value: "svelte", label: "Svelte" },
            ],
            initialValue: "react",
          });
        },
        // language: () => {
        //   return p.select({
        //     message: "Will you be using TypeScript or JavaScript? (JS is not supported yet)",
        //     options: [
        //       { value: "typescript", label: "TypeScript" },
        //       // { value: "javascript", label: "JavaScript" },
        //     ],
        //     initialValue: "typescript",
        //   });
        // },

        ...(!cliResults.flags.tailwind && {
          styling: () => {
            return p.confirm({
              message: "Will you be using Tailwind CSS for styling?",
            });
          },
        }),
        versioning: () => {
          return p.select({
            message: "What versioning system would you like to use? (Only supported in Github)",
            options: [
              { value: "none", label: "None or BYO" },
              { value: "basic", label: "Basic (Recommended - Will version and build your app)" },
              //{ value: "semver", label: "Semantic Versioning(@changesets/cli)" },
            ],
            initialValue: "basic",
          })
        },
        ...(!cliResults.flags.noGit && {
          git: () => {
            return p.confirm({
              message:
                "Should we initialize a Git repository and stage the changes?",
              initialValue: !defaultOptions.flags.noGit,
            });
          },
        }),
        ...(!cliResults.flags.noInstall && {
          install: () => {
            return p.confirm({
              message:
                `Should we run '${pkgManager}` +
                (pkgManager === "yarn" ? `'?` : ` install' for you?`),
              initialValue: !defaultOptions.flags.noInstall,
            });
          },
        }),
        importAlias: () => {
          return p.text({
            message: "What import alias would you like to use?",
            defaultValue: defaultOptions.flags.importAlias,
            placeholder: defaultOptions.flags.importAlias,
            validate: validateImportAlias,
          });
        },
      },
      {
        onCancel() {
          process.exit(1);
        },
      }
    );

    const packages: AvailablePackages[] = [];
    if (project.styling) packages.push("tailwind");

    return {
      appName: project.name ?? cliResults.appName,
      packages,
      framework: project.framework as AvailableFrameworks,
      flags: {
        ...cliResults.flags,
        noGit: !project.git || cliResults.flags.noGit,
        noInstall: !project.install || cliResults.flags.noInstall,
        importAlias: project.importAlias ?? cliResults.flags.importAlias,
        tailwind: project.styling ?? cliResults.flags.tailwind,
      },
    };
  } catch (err) {
    // If the user is not calling create-zcrm-widget from an interactive terminal, inquirer will throw an IsTTYError
    // If this happens, we catch the error, tell the user what has happened, and then continue to run the program with a default widget
    if (err instanceof IsTTYError) {
      logger.warn(`
  ${CREATE_ZCRM_WIDGET} needs an interactive terminal to provide options`);

      const shouldContinue = await p.confirm({
        message: `Continue scaffolding a default widget?`,
        initialValue: true,
      });

      if (!shouldContinue) {
        logger.info("Exiting...");
        process.exit(0);
      }

      logger.info(`Bootstrapping a default widget in ./${cliResults.appName}`);
    } else {
      throw err;
    }
  }

  return cliResults;
};
