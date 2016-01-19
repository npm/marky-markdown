# mkhere

Command line utility used to create files based on pre-defined templates

[![NPM](https://nodei.co/npm/mkhere.png)](https://nodei.co/npm/mkhere/)

### Usage

    --------------------------------------------------
    mkhere: Create files based on predefined templates
    --------------------------------------------------

    Run: mkhere init
             To create .templates directory within your home containing sample templates.
    Run: mkhere list
             To list all templates in /home/sasha/.templates
    Run: mkhere tplname.html newname
             This will create new file newname.html based on /home/sasha/.templates/tplname.html in current directory
    Run: mkhere html.html ~/Desktop/sa
             This will create new file sa.html based on /home/sasha/.templates/html.html on the desktop

    ------------------Auto-completion-----------------

    Run: mkhere --completion >> ~/.mkhere.completion.sh && echo 'source ~/.mkhere.completion.sh' >> ~/.bashrc
            In order to enable auto-completion in your `BASH` terminal
    Or: echo '. <(./mkhere --completion)' >> .zshrc
            if you're using `ZSH`