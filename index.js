const fs = require('fs');
const program = require('commander');
const clone = require('git-clone');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const logger = require('tracer').colorConsole();
const ProgressBar = require('progress');
const shell = require('shelljs');

program.version('1.0.0', '-v, --version')
  .command('init <name>')
  .action((name) => {
    if (!fs.existsSync(name)) {
      inquirer.prompt([{
          name: 'name',
          message: '请输入项目名称',
          default: `${name}`
        }, {
          name: 'description',
          message: '请输入项目描述',
          default: `A project named ${name}`
        },
        {
          name: 'version',
          message: '请输入项目的版本号',
          default: '1.0.0'
        },
        {
          name: 'author',
          message: '请输入作者',
          default: 'bobby'
        }
      ]).then((answers) => {
        // logger.info(answers)
        const url = 'https://github.com:username/templates-repo.git';
        const url2 = 'https://github.com/oOBobbyOo/restful-api.git';

        let bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 20,
          total: 10
        });

        const spinner = ora('正在下载模板...');
        spinner.start();

        clone(url2, name, null, (err) => {
          if (err) {
            spinner.fail();
            console.log(symbols.error, chalk.red(err));
          } else {
            spinner.succeed();
            shell.rm('-rf', `${name}/.git`) //删除.git
            const fileName = `${name}/package.json`;
            const meta = {
              name,
              description: answers.description,
              author: answers.author
            }
            if (fs.existsSync(fileName)) {
              const content = fs.readFileSync(fileName).toString();
              const result = handlebars.compile(content)(meta);
              // console.log(result);
              fs.writeFileSync(fileName, result);
            }
            bar.tick();
            console.log(symbols.success, chalk.green('项目初始化完成'));
          }
        })
      })
    } else {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  });
program.parse(process.argv);