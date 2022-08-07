FROM linuxserver/ffmpeg:version-4.4-cli
RUN apt-get update && \
    apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        python3-setuptools \
        groff \
        less \
    && pip3 install --upgrade pip \
    && apt-get clean

WORKDIR /usr/app
RUN python3 -m venv /usr/app/venv
ENV PATH="/usr/app/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY main.py .
ENTRYPOINT []
CMD ["python", "main.py"]

